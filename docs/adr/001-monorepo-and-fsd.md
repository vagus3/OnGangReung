# 001. 모노레포 + Feature-Sliced Design 아키텍처 채택

날짜: 2026-06-27
상태: Accepted

## 배경 (Context)

풀스택(프론트엔드 + 백엔드 + 모바일) 프로젝트에서 코드 공유, 일관된 타입 정의,
배포 파이프라인 통합 관리가 필요했습니다.
프론트엔드 내부에서는 기능이 늘어날수록 폴더 구조가 무너지는 문제가 반복됐습니다.

## 선택지 (Options)

1. 멀티레포(각 앱별 별도 저장소)
   - 장점: 독립적인 배포, 낮은 초기 복잡도
   - 단점: 타입 공유 어려움, 의존성 관리 분산, CI/CD 중복

2. 모노레포 + 단순 레이어 구조(components/hooks/utils)
   - 장점: 익숙한 구조
   - 단점: 규모 성장 시 폴더가 비대해짐, 의존성 방향 불명확

3. 모노레포 + Feature-Sliced Design
   - 장점: 기능 단위 응집, 레이어 간 의존성 규칙 명확, 확장성 좋음
   - 단점: 초기 학습 비용

## 결정 (Decision)

pnpm workspaces + Turborepo 기반 모노레포를 채택하고,
프론트엔드 내부 구조는 Feature-Sliced Design(FSD)을 적용합니다.
백엔드는 Clean Architecture 레이어 구조를 적용합니다.

## 결과 (Consequences)

긍정적:

- 패키지 간 타입 공유가 @project/types로 단순화됨
- FSD 레이어 규칙으로 의존성 방향이 명확해짐
- Turborepo의 빌드 캐싱으로 CI 시간 단축

부정적:

- 모노레포 초기 설정 복잡도 증가
- FSD 개념을 팀 전체가 학습해야 함

향후 고려사항:

- 팀 규모가 커지면 Nx로 마이그레이션 고려
- eslint-plugin-boundaries로 레이어 규칙 자동 강제 예정
