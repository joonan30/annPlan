# annPlan

**연구과제 통합 관리 대시보드** - 교수·연구자를 위한 프로젝트 관리 도구

여러 연구과제의 일정, 세부과제, 인력, 논문을 하나의 웹 페이지에서 통합 관리합니다.

<img width="100%" alt="annPlan screenshot" src="https://via.placeholder.com/800x400?text=annPlan+Dashboard">

## 주요 기능

- **프로젝트 타임라인** — 간트 차트로 전체 과제 일정 시각화
- **연차별 상세 관리** — 세부과제 체크리스트, 진행률 추적, 산출물 관리
- **논문 관리** — 논문별 상태 추적 (준비→집필→투고→수정→수락→출판), 프로젝트 연계
- **팀 구성원** — 학생/연구원별 참여과제, 연구분야, 졸업 일정
- **과제간 연결** — task 레벨의 교차 의존성 시각화 + 네트워크 그래프
- **마일스톤** — 다가오는 보고서/평가 일정 알림
- **HWP 계획서 파싱** — hwp-mcp를 통해 HWP 연구계획서에서 자동 데이터 추출

## 빠른 시작

### 1. 다운로드

```bash
git clone https://github.com/joonanlab/annPlan.git
cd annPlan
```

### 2. 실행

**macOS:**
```bash
# 더블클릭으로도 실행 가능
./start.command
```

**Windows:**
```bash
start.bat
```

**수동 실행:**
```bash
python3 server.py
# 브라우저에서 http://localhost:9753 접속
```

### 3. 데이터 입력

`data.js`를 직접 편집하거나, HWP 계획서를 파싱하여 자동 생성합니다.

## HWP 계획서 파싱

### 방법 1: hwp-mcp + Claude Code (권장)

[hwp-mcp](https://github.com/jkf87/hwp-mcp)를 Claude Code의 MCP 서버로 설정하면, HWP 파일을 직접 읽어서 data.js 형식으로 변환할 수 있습니다.

**설정:**

`~/.claude/settings.json`에 추가:

```json
{
  "mcpServers": {
    "hwp-mcp": {
      "command": "npx",
      "args": ["-y", "hwp-mcp"]
    }
  }
}
```

**사용:**

```
# Claude Code에서
"~/계획서.hwp 파일을 읽고 annPlan data.js 형식으로 변환해줘"
```

### 방법 2: parse_hwp.py 스크립트

```bash
# pyhwp 설치
pip install pyhwp

# 텍스트 추출만
python3 tools/parse_hwp.py 계획서.hwp --text-only

# Claude API로 구조화 (ANTHROPIC_API_KEY 필요)
export ANTHROPIC_API_KEY=sk-...
python3 tools/parse_hwp.py 계획서.hwp -o project_data.js
```

### 방법 3: 수동 입력

`tools/PROMPT_TEMPLATE.md`의 데이터 구조를 참고하여 `data.js`를 직접 편집합니다.

## 데이터 구조

```
annPlan/
├── index.html          # 메인 대시보드
├── data.js             # 프로젝트 데이터 (직접 편집)
├── tracking.js         # 진행 상태 (자동 저장)
├── server.py           # 로컬 저장 서버
├── start.command       # macOS 실행기
├── start.bat           # Windows 실행기
├── lib/
│   ├── app.js          # 앱 로직
│   └── styles.css      # 스타일
└── tools/
    ├── parse_hwp.py    # HWP 파서
    └── PROMPT_TEMPLATE.md  # 파싱 프롬프트 템플릿
```

### data.js

프로젝트, 구성원, 논문, 일정 등 모든 정적 데이터가 들어있습니다.
직접 편집하거나 HWP 파서를 통해 생성합니다.

### tracking.js

진행 상태 추적 데이터 (task 완료 여부, 메모 등)가 자동 저장됩니다.
서버 모드에서는 자동 저장, 파일 모드에서는 다운로드로 저장합니다.

## 사용법

### 세부과제 진행 관리

각 프로젝트를 펼치면 연차별 세부과제가 체크리스트로 표시됩니다.
체크박스를 클릭하여 완료 표시하고, 메모 버튼으로 노트를 추가할 수 있습니다.

### 논문 관리

- **+ 논문 추가** 버튼으로 새 논문 생성
- 상태: 준비중 → 집필중 → 투고 → 수정중 → 재투고 → 수락 → 출판
- 저자: 연구실 구성원에서 클릭하여 추가/정렬
- 프로젝트 연계: 해당 논문과 관련된 과제를 연결

### 과제간 연결

`data.js`의 `taskConnections`에 task 간 연결을 정의하면:
- 연결 테이블에서 한눈에 확인
- task 옆 링크 버튼으로 관련 task 바로 이동
- 네트워크 그래프에서 전체 구조 시각화

## 커스터마이징

### 색상 변경

`data.js`에서 각 프로젝트의 `color` 값을 수정하세요.

### UI 수정

`lib/styles.css`의 CSS 변수를 수정하면 전체 테마를 변경할 수 있습니다:

```css
:root {
  --bg: #f5f6fa;      /* 배경색 */
  --card: #ffffff;     /* 카드 배경 */
  --accent: #2563eb;   /* 강조색 */
}
```

## 요구사항

- Python 3.6+ (로컬 서버용)
- 최신 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- (선택) hwp-mcp 또는 pyhwp — HWP 파싱용

## 라이선스

MIT License

## 만든이

[Joon An](https://github.com/joonan30) — 고려대학교
