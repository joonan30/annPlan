# annPlan - HWP 계획서 파싱 프롬프트

Claude Code에서 hwp-mcp를 설정한 후, 아래 프롬프트를 사용하여
HWP 연구과제 계획서를 annPlan 데이터로 변환하세요.

## 프롬프트

```
[HWP 파일 경로]의 연구과제 계획서를 읽고, annPlan의 data.js 형식으로 변환해주세요.

추출할 항목:
1. 과제 기본정보: 과제명, 약칭, 과제번호, 지원기관, 사업명, 수행기관, 역할(책임/공동/참여/위탁), PI, 참여율, 연간예산, 시작일, 종료일
2. 연차별 목표와 세부과제(tasks) - 각 task에 고유 ID 부여
3. 연차별 산출물(deliverables)
4. 최종목표 및 키워드
5. 공동연구자/참여연구원 정보 (있는 경우)
6. 과제간 연결 가능성 (기존 프로젝트와 겹치는 부분)

data.js의 projects 배열에 추가할 수 있는 JavaScript 객체 형태로 출력해주세요.
```

## data.js 프로젝트 구조 예시

```javascript
{
  id: "project-id",           // 영문 소문자 + 하이픈
  name: "과제 전체명",
  shortName: "약칭",          // 간트차트/UI용 짧은 이름
  projectNo: "RS-2025-...",
  funder: "과기정통부",
  program: "중견연구자지원사업",
  department: "",
  institution: "OO대학교",
  role: "책임",               // 책임/공동/참여/위탁
  pi: "홍길동",
  participationRate: 20,      // %
  annualBudget: 20000,        // 만원
  status: "active",           // active/completed
  start: "2025-03",           // YYYY-MM
  end: "2028-02",
  totalMonths: 36,
  color: "#00695C",           // 프로젝트 고유 색상
  phases: [
    {
      name: "1년차",
      start: "2025-03",
      end: "2026-02",
      status: "active",       // active/completed/planned
      stage: "1단계",
      topic: "연차 주제",
      tasks: [
        { id: "project-id-0-0", text: "세부과제 내용", links: [] },
      ],
      deliverables: ["산출물1", "산출물2"],
    },
  ],
  keywords: ["키워드1", "키워드2"],
  notes: "비고",
}
```
