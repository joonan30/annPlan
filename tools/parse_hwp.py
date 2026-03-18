#!/usr/bin/env python3
"""
annPlan HWP 계획서 파서

사용법:
  python3 tools/parse_hwp.py <hwp파일경로> [--output data_fragment.js]

사전 요구사항:
  1. hwp-mcp 설치: https://github.com/jkf87/hwp-mcp
     npx -y @nicepkg/gpt-runner dlx hwp-mcp
     또는
     pip install pyhwp (대안)

  2. Claude Code에서 직접 사용:
     hwp-mcp를 MCP 서버로 설정한 후, Claude에게 HWP 파일을 읽고
     data.js 형식으로 변환해달라고 요청하세요.

이 스크립트는 pyhwp를 사용하여 HWP에서 텍스트를 추출한 뒤,
Claude API를 통해 구조화된 프로젝트 데이터로 변환합니다.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile


def extract_text_pyhwp(hwp_path):
    """pyhwp를 사용하여 HWP에서 텍스트 추출"""
    try:
        import hwp5
        from hwp5.hwp5txt import Hwp5Txt
        with open(hwp_path, 'rb') as f:
            hwp = hwp5.open(f)
            txt = Hwp5Txt(hwp)
            return txt.text()
    except ImportError:
        pass

    # 대안: hwp5txt CLI
    try:
        result = subprocess.run(
            ['hwp5txt', hwp_path],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            return result.stdout
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # 대안: hwp-mcp CLI
    try:
        result = subprocess.run(
            ['npx', '-y', 'hwp-mcp', 'extract', hwp_path],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode == 0:
            return result.stdout
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return None


def generate_prompt(text, hwp_path):
    """Claude API용 프롬프트 생성"""
    filename = os.path.basename(hwp_path)
    return f"""다음은 연구과제 계획서 "{filename}"에서 추출한 텍스트입니다.
이 텍스트를 분석하여 annPlan data.js 형식의 프로젝트 데이터를 JSON으로 생성하세요.

추출할 항목:
1. 과제 기본정보: id, name, shortName, projectNo, funder, program, institution, role, pi, annualBudget, start, end, totalMonths
2. 연차별 상세: phases 배열 (name, start, end, status, stage, topic, tasks, deliverables)
3. 각 task: id (프로젝트id-연차idx-task번호), text, links (빈배열)
4. keywords, notes
5. 공동연구자 정보가 있다면 members 배열도 생성

JSON만 출력하세요. 코드 블록 없이 순수 JSON만.

계획서 텍스트:
---
{text[:15000]}
---"""


def call_claude_api(prompt):
    """Claude API 호출"""
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return None

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except ImportError:
        print("anthropic 패키지가 없습니다: pip install anthropic", file=sys.stderr)
        return None
    except Exception as e:
        print(f"API 호출 실패: {e}", file=sys.stderr)
        return None


def generate_data_fragment(project_json, output_path):
    """data.js에 삽입 가능한 프로젝트 데이터 조각 생성"""
    template = f"""// ── 자동 생성된 프로젝트 데이터 ──────────────────────────────
// 이 데이터를 data.js의 projects 배열에 추가하세요.
// 생성일: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}

{json.dumps(project_json, ensure_ascii=False, indent=2)}
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(template)
    print(f"✓ 프로젝트 데이터가 {output_path}에 저장되었습니다.", file=sys.stderr)
    print(f"  data.js의 projects 배열에 이 내용을 추가하세요.", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description='HWP 연구과제 계획서를 annPlan 데이터로 변환'
    )
    parser.add_argument('hwp_file', help='HWP 파일 경로')
    parser.add_argument('--output', '-o', default=None,
                       help='출력 파일 경로 (기본: stdout)')
    parser.add_argument('--text-only', action='store_true',
                       help='텍스트만 추출 (API 호출 없이)')
    args = parser.parse_args()

    if not os.path.exists(args.hwp_file):
        print(f"파일을 찾을 수 없습니다: {args.hwp_file}", file=sys.stderr)
        sys.exit(1)

    print(f"HWP 텍스트 추출 중: {args.hwp_file}", file=sys.stderr)
    text = extract_text_pyhwp(args.hwp_file)

    if not text:
        print("""
텍스트 추출 실패. 다음 방법 중 하나를 시도하세요:

1. pyhwp 설치:
   pip install pyhwp

2. hwp-mcp 사용 (Claude Code MCP 서버):
   https://github.com/jkf87/hwp-mcp

3. HWP를 수동으로 텍스트로 변환한 후 이 스크립트에 전달

4. Claude Code에서 직접:
   "이 HWP 파일을 읽고 annPlan data.js 형식으로 변환해줘"
""", file=sys.stderr)
        sys.exit(1)

    if args.text_only:
        print(text)
        return

    print("Claude API로 구조화 중...", file=sys.stderr)
    prompt = generate_prompt(text, args.hwp_file)
    result = call_claude_api(prompt)

    if not result:
        print("\nClaude API를 사용할 수 없습니다.", file=sys.stderr)
        print("추출된 텍스트를 출력합니다. Claude Code에서 직접 변환하세요.\n", file=sys.stderr)
        print(text)
        return

    try:
        project_data = json.loads(result)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        match = re.search(r'\{[\s\S]*\}', result)
        if match:
            project_data = json.loads(match.group())
        else:
            print("JSON 파싱 실패. 원본 응답:", file=sys.stderr)
            print(result)
            return

    if args.output:
        generate_data_fragment(project_data, args.output)
    else:
        print(json.dumps(project_data, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
