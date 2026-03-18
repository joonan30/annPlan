// ============================================================
// annPlan - 프로젝트 데이터 (샘플)
// 이 파일을 직접 편집하거나, tools/parse_hwp.py로 HWP 계획서를 파싱하세요.
// 날짜 형식: "YYYY-MM" (예: "2025-03")
// task 형식: { id: "프로젝트-연차-번호", text: "내용", links: ["연결된task ID"] }
// ============================================================

const RESEARCH_DATA = {

  meta: {
    owner: "홍길동",
    affiliation: "한국대학교 컴퓨터공학과",
    lastUpdated: "2026-03-18"
  },

  projects: [

    // ── 1. AI신약 (책임) ────────────────────────────────────

    {
      id: "ai-drug",
      name: "딥러닝 기반 신약 후보물질 예측 및 최적화 플랫폼 개발",
      shortName: "AI신약",
      projectNo: "RS-2025-00000001",
      funder: "과기정통부",
      program: "중견연구자지원사업",
      department: "이공분야기초연구사업",
      institution: "한국대학교",
      role: "책임",
      pi: "홍길동",
      participationRate: 30,
      annualBudget: 20000,
      status: "active",
      start: "2025-03",
      end: "2028-02",
      totalMonths: 36,
      color: "#00695C",
      phases: [
        {
          name: "1년차", start: "2025-03", end: "2026-02", status: "active",
          stage: "1단계 (데이터 구축·모델 설계)",
          topic: "화합물 라이브러리 구축 및 분자 표현 학습 모델 개발",
          tasks: [
            { id: "ai-drug-0-0", text: "ChEMBL·PubChem 통합 화합물 데이터셋 구축 (약 200만 compounds)", links: ["smart-air-0-2"] },
            { id: "ai-drug-0-1", text: "분자 그래프 뉴럴 네트워크(GNN) 기반 약물 활성 예측 모델 설계", links: [] },
            { id: "ai-drug-0-2", text: "SMILES 기반 사전학습 모델(MolBERT) 파인튜닝", links: [] },
            { id: "ai-drug-0-3", text: "약물-단백질 상호작용 데이터 정제 및 벤치마크 세트 구성", links: [] },
            { id: "ai-drug-0-4", text: "분자 기술자(descriptor) 자동 추출 파이프라인 개발", links: [] },
          ],
          deliverables: ["통합 화합물 데이터셋", "약물 활성 예측 모델 v1"],
        },
        {
          name: "2년차", start: "2026-03", end: "2027-02", status: "planned",
          stage: "1단계",
          topic: "AI 모델 고도화 및 가상 스크리닝 파이프라인 구축",
          tasks: [
            { id: "ai-drug-1-0", text: "GNN + Transformer 통합 예측 모델 개발", links: [] },
            { id: "ai-drug-1-1", text: "강화학습 기반 분자 생성 모델 개발 (de novo design)", links: [] },
            { id: "ai-drug-1-2", text: "가상 스크리닝 파이프라인 자동화: Docking + ML scoring", links: ["quantum-opt-1-0"] },
            { id: "ai-drug-1-3", text: "약물 유사성 네트워크 분석 및 다중표적 예측", links: [] },
          ],
          deliverables: ["통합 예측 모델", "가상 스크리닝 파이프라인"],
        },
        {
          name: "3년차", start: "2027-03", end: "2028-02", status: "planned",
          stage: "2단계 (검증·응용)",
          topic: "실험 검증 및 임상 후보 선별",
          tasks: [
            { id: "ai-drug-2-0", text: "AI 예측 상위 50개 화합물 실험적 활성 검증 (IC50 측정)", links: [] },
            { id: "ai-drug-2-1", text: "ADMET 예측 모델 통합 및 최적화", links: [] },
            { id: "ai-drug-2-2", text: "임상 후보 물질 3종 선별 및 특허 출원", links: [] },
            { id: "ai-drug-2-3", text: "오픈소스 약물 발견 플랫폼 공개", links: [] },
          ],
          deliverables: ["검증된 후보 물질 3종", "오픈소스 플랫폼"],
        },
      ],
      keywords: ["딥러닝", "신약개발", "GNN", "가상 스크리닝", "분자 생성"],
      notes: "핵심 개인연구과제. 2단계 구성 (1단계 2년 + 2단계 1년). 협력: 약학대학 분자시뮬레이션 실험실",
    },

    // ── 2. 스마트대기 (공동) ────────────────────────────────

    {
      id: "smart-air",
      name: "IoT 센서 네트워크 기반 도시 대기질 실시간 예측 시스템 개발",
      shortName: "스마트대기",
      projectNo: "RS-2024-00000002",
      funder: "환경부",
      program: "환경기술개발사업",
      department: "환경부",
      institution: "한국대학교",
      role: "공동",
      pi: "박지수",
      participationRate: 20,
      annualBudget: 15000,
      status: "active",
      start: "2024-09",
      end: "2027-08",
      totalMonths: 36,
      color: "#1565C0",
      phases: [
        {
          name: "1차년도", start: "2024-09", end: "2025-08", status: "completed",
          topic: "센서 네트워크 설계 및 데이터 수집 인프라 구축",
          tasks: [
            { id: "smart-air-0-0", text: "저비용 미세먼지·오존 센서 모듈 프로토타입 개발 및 교정", links: [] },
            { id: "smart-air-0-1", text: "시범 지역 20개 노드 설치 및 실시간 데이터 수집 시작", links: [] },
            { id: "smart-air-0-2", text: "기상청·에어코리아 공공 데이터 연동 파이프라인 구축", links: ["ai-drug-0-0"] },
          ],
          deliverables: ["센서 프로토타입", "데이터 수집 인프라"],
        },
        {
          name: "2차년도", start: "2025-09", end: "2026-08", status: "active",
          topic: "AI 기반 대기질 예측 모델 개발",
          tasks: [
            { id: "smart-air-1-0", text: "시공간 그래프 뉴럴 네트워크(ST-GNN) 기반 PM2.5 24시간 예측 모델", links: [] },
            { id: "smart-air-1-1", text: "센서 교차보정 알고리즘: 참조급 측정기 대비 R² > 0.9 달성", links: [] },
            { id: "smart-air-1-2", text: "실시간 모니터링 대시보드 웹 앱 프로토타입 개발", links: [] },
          ],
          deliverables: ["PM2.5 예측 모델", "실시간 대시보드 프로토타입"],
        },
        {
          name: "3차년도", start: "2026-09", end: "2027-08", status: "planned",
          topic: "시스템 확장 및 현장 검증",
          tasks: [
            { id: "smart-air-2-0", text: "센서 네트워크 100개 노드로 확장 (5개 자치구)", links: [] },
            { id: "smart-air-2-1", text: "예측 정확도 검증: PM2.5 MAE < 5 μg/m³ 목표", links: [] },
            { id: "smart-air-2-2", text: "지자체 연계 시민 대기질 알림 시범 서비스 운영", links: [] },
          ],
          deliverables: ["확장 센서 네트워크", "시범 서비스 운영 보고서"],
        },
      ],
      keywords: ["IoT", "대기질", "미세먼지", "시공간 예측", "센서 네트워크"],
      notes: "공동연구원 (세부2). PI: 박지수 교수 (환경공학과). AI 모델 개발 담당.",
    },

    // ── 3. 양자최적화 (참여) ────────────────────────────────

    {
      id: "quantum-opt",
      name: "양자 영감 최적화 알고리즘을 활용한 조합 최적화 문제 해결",
      shortName: "양자최적화",
      projectNo: "RS-2025-00000003",
      funder: "과기정통부",
      program: "신진연구자지원사업",
      department: "이공분야기초연구사업",
      institution: "한국대학교",
      role: "참여",
      pi: "이민호",
      participationRate: 10,
      annualBudget: 10000,
      status: "active",
      start: "2025-06",
      end: "2028-05",
      totalMonths: 36,
      color: "#6A1B9A",
      phases: [
        {
          name: "1년차", start: "2025-06", end: "2026-05", status: "active",
          stage: "기반 구축",
          topic: "QAOA 변형 알고리즘 설계 및 시뮬레이터 구축",
          tasks: [
            { id: "quantum-opt-0-0", text: "양자 근사 최적화 알고리즘(QAOA) 변형 설계 및 이론 분석", links: [] },
            { id: "quantum-opt-0-1", text: "Qiskit 기반 시뮬레이터 환경 구축 및 벤치마크 실행", links: [] },
            { id: "quantum-opt-0-2", text: "벤치마크 조합 최적화 문제 세트 구성 (TSP, MaxCut, 포트폴리오)", links: [] },
          ],
          deliverables: ["QAOA 변형 알고리즘", "시뮬레이션 환경"],
        },
        {
          name: "2년차", start: "2026-06", end: "2027-05", status: "planned",
          stage: "알고리즘 개발",
          topic: "하이브리드 양자-고전 알고리즘 개발 및 성능 평가",
          tasks: [
            { id: "quantum-opt-1-0", text: "VQE 기반 분자 에너지 시뮬레이션 적용 (약물 결합 에너지)", links: ["ai-drug-1-2"] },
            { id: "quantum-opt-1-1", text: "하이브리드 양자-고전 최적화 프레임워크 개발", links: [] },
            { id: "quantum-opt-1-2", text: "NISQ 디바이스 노이즈 모델링 및 오류 경감 기법 구현", links: [] },
          ],
          deliverables: ["하이브리드 최적화 프레임워크"],
        },
        {
          name: "3년차", start: "2027-06", end: "2028-05", status: "planned",
          stage: "응용·검증",
          topic: "실제 산업 문제 적용 및 성능 비교",
          tasks: [
            { id: "quantum-opt-2-0", text: "물류 경로 최적화 실제 데이터 적용: 고전 대비 성능 비교", links: [] },
            { id: "quantum-opt-2-1", text: "IBM Quantum / AWS Braket 실 하드웨어 실험", links: [] },
            { id: "quantum-opt-2-2", text: "오픈소스 라이브러리 공개 및 벤치마크 논문 작성", links: [] },
          ],
          deliverables: ["산업 적용 사례", "오픈소스 라이브러리"],
        },
      ],
      keywords: ["양자컴퓨팅", "QAOA", "VQE", "조합최적화", "NISQ"],
      notes: "참여연구원. PI: 이민호 교수 (물리학과). 양자 알고리즘의 약물 설계 및 물류 최적화 적용.",
    },

  ],

  // ── 프로젝트 간 연결 관계 ──────────────────────────────
  connections: [
    { from: "ai-drug", to: "smart-air",    type: "data",   label: "데이터 파이프라인" },
    { from: "ai-drug", to: "quantum-opt",  type: "method", label: "분자 시뮬레이션" },
    { from: "smart-air", to: "quantum-opt", type: "theme",  label: "최적화 응용" },
  ],

  // ── 작업 수준 연결 관계 ──────────────────────────────
  taskConnections: [
    { from: "ai-drug-0-0",  to: "smart-air-0-2",   label: "공공 데이터 파이프라인 공유" },
    { from: "ai-drug-1-2",  to: "quantum-opt-1-0",  label: "분자 결합 에너지 최적화 연계" },
  ],

  // ── 주요 일정 ─────────────────────────────────────────
  milestones: [
    { date: "2026-02", project: "ai-drug",      label: "1년차 종료 / 연차보고서",     type: "report" },
    { date: "2026-05", project: "quantum-opt",  label: "1년차 종료 / 연차보고서",     type: "report" },
    { date: "2026-08", project: "smart-air",    label: "2차년도 종료",                type: "report" },
    { date: "2027-02", project: "ai-drug",      label: "2년차 종료 / 1단계 평가",     type: "deadline" },
    { date: "2027-08", project: "smart-air",    label: "과제 종료",                   type: "deadline" },
    { date: "2028-02", project: "ai-drug",      label: "과제 종료",                   type: "deadline" },
    { date: "2028-05", project: "quantum-opt",  label: "과제 종료",                   type: "deadline" },
  ],

  // ── 연구실 구성원 ────────────────────────────────────────
  members: [

    // ── 박사 / 포닥 ────────────────────
    {
      id: "seoyeon-kim", name: "김서연", nameEn: "Seoyeon Kim",
      position: "박사", area: "AI", fellowship: "NRF",
      enrollment: "2022-03", graduation: "2026-08", status: "active",
      research: "GNN 기반 분자 특성 예측, 약물 재창출(drug repurposing)",
      projects: ["ai-drug", "smart-air"],
      notes: "통합과정. 2026 졸업 예정",
    },
    {
      id: "jinho-park", name: "박진호", nameEn: "Jinho Park",
      position: "포닥", area: "AI", fellowship: null,
      enrollment: "2025-09", graduation: null, status: "active",
      research: "Transformer 기반 분자 생성 모델, ADMET 예측",
      projects: ["ai-drug"],
      notes: "타교 박사 졸업 후 합류",
    },

    // ── 연구원 ─────────────────────────
    {
      id: "minji-lee", name: "이민지", nameEn: "Minji Lee",
      position: "연구원", area: "AI", fellowship: null,
      enrollment: "2024-03", graduation: null, status: "active",
      research: "시공간 딥러닝, 환경 데이터 분석",
      projects: ["smart-air", "ai-drug"],
      notes: "",
    },

    // ── 석사 ───────────────────────────
    {
      id: "hyunwoo-choi", name: "최현우", nameEn: "Hyunwoo Choi",
      position: "석사", area: "AI", fellowship: null,
      enrollment: "2024-09", graduation: "2026-08", status: "active",
      research: "강화학습 기반 분자 설계, de novo drug design",
      projects: ["ai-drug"],
      notes: "",
    },
    {
      id: "yuna-jung", name: "정유나", nameEn: "Yuna Jung",
      position: "석사", area: "AI", fellowship: "BK21",
      enrollment: "2025-03", graduation: null, status: "active",
      research: "IoT 센서 데이터 전처리, 시계열 예측 모델",
      projects: ["smart-air"],
      notes: "",
    },
    {
      id: "donghyun-oh", name: "오동현", nameEn: "Donghyun Oh",
      position: "석사", area: "AI", fellowship: null,
      enrollment: "2025-03", graduation: null, status: "active",
      research: "양자 머신러닝, 조합최적화 알고리즘",
      projects: ["quantum-opt", "ai-drug"],
      notes: "",
    },
    {
      id: "soyoung-han", name: "한소영", nameEn: "Soyoung Han",
      position: "석사", area: "AI", fellowship: null,
      enrollment: "2026-03", graduation: null, status: "active",
      research: "ADMET 예측, 약물 안전성 평가 AI",
      projects: ["ai-drug"],
      notes: "2026-03 입학",
    },

    // ── 학부 인턴 ──────────────────────
    {
      id: "taeho-kim", name: "김태호", nameEn: "Taeho Kim",
      position: "학사", area: null, fellowship: null,
      enrollment: null, graduation: null, status: "active",
      research: "", projects: ["ai-drug"], notes: "",
    },
    {
      id: "jiwon-lee", name: "이지원", nameEn: "Jiwon Lee",
      position: "학사", area: null, fellowship: null,
      enrollment: null, graduation: null, status: "active",
      research: "", projects: ["smart-air"], notes: "",
    },
  ],

  // ── 논문 ─────────────────────────────────────────────
  papers: [
    {
      id: "paper-1",
      title: "MolGraphNet: A Multi-Scale Graph Neural Network for Drug Activity Prediction",
      authors: ["seoyeon-kim", "hyunwoo-choi"],
      correspondingAuthor: "pi",
      journal: "Bioinformatics",
      targetJournal: "Bioinformatics",
      status: "writing",
      projects: ["ai-drug"],
      submittedDate: null,
      acceptedDate: null,
      doi: null,
      notes: "1년차 핵심 성과 논문. GNN 모델 성능 벤치마크 포함.",
    },
    {
      id: "paper-2",
      title: "Spatio-Temporal Graph Networks for Urban Air Quality Forecasting with Low-Cost Sensor Data",
      authors: ["seoyeon-kim", "yuna-jung", "minji-lee"],
      correspondingAuthor: "pi",
      journal: "",
      targetJournal: "Environmental Science & Technology",
      status: "preparing",
      projects: ["smart-air"],
      submittedDate: null,
      acceptedDate: null,
      doi: null,
      notes: "2차년도 성과 논문. PM2.5 예측 정확도 비교 포함.",
    },
    {
      id: "paper-3",
      title: "Hybrid Quantum-Classical Optimization for Molecular Docking",
      authors: ["donghyun-oh"],
      correspondingAuthor: "pi",
      journal: "",
      targetJournal: "Journal of Chemical Theory and Computation",
      status: "preparing",
      projects: ["quantum-opt", "ai-drug"],
      submittedDate: null,
      acceptedDate: null,
      doi: null,
      notes: "2년차 목표. VQE 기반 분자 시뮬레이션과 약물 도킹 연계.",
    },
  ],

};
