# 004. AI 도구 전환 — Gemini CLI에서 Antigravity CLI로

날짜: 2026-07-04
상태: Accepted

## 배경 (Context)

ADR 003에서 대용량 컨텍스트 분석/문서화 역할로 Gemini CLI를 채택했으나,
Google이 2026년 6월 18일부로 Gemini CLI 및 Gemini Code Assist IDE 확장의
요청 처리를 중단했습니다 (무료/Pro/Ultra 티어 기준, 엔터프라이즈 제외).
후속 도구로 Antigravity CLI(명령어 `agy`)가 제공됩니다.

## 선택지 (Options)

1. Antigravity CLI로 전환
   - 장점: 공식 후속 도구, Gemini 3 기반으로 역할(대용량 컨텍스트) 동일 유지,
     기존 GEMINI.md/AGENTS.md 컨텍스트 파일 하위 호환, 멀티 에이전트 백그라운드 실행 지원
   - 단점: 클로즈드소스 Go 재작성으로 출시 시점 기능 패리티 미달, 자동화 스크립트 재검증 필요

2. Gemini 역할을 Claude/Codex로 흡수 (2모델 체제)
   - 장점: 관리 도구 수 감소
   - 단점: 대용량 컨텍스트/저비용 대량 처리 슬롯이 사라져 비용 최적화 전략 훼손

## 결정 (Decision)

Antigravity CLI로 전환합니다.

이유: ADR 003의 역할 분담 전략(대용량 컨텍스트 = Gemini 계열)은 여전히 유효하고,
Antigravity는 동일한 Gemini 3 모델 기반의 공식 후속 도구이므로
도구 이름과 명령어만 교체하면 기존 전략을 그대로 유지할 수 있습니다.

적용 사항:

- `ai_config.json`: `gemini` 항목을 `antigravity`(command: `agy`)로 교체
- `.ai/GEMINI.md` → `.ai/ANTIGRAVITY.md` 개명 및 내용 갱신
- `scripts/ai.sh`, `scripts/switch_model.sh`의 모델 목록 갱신
- 루트 `AGENTS.md`가 Antigravity의 프로젝트 컨텍스트 파일 역할을 겸함

## 결과 (Consequences)

긍정적:

- 서비스 중단된 CLI를 계속 참조하는 죽은 설정 제거
- Antigravity의 멀티 에이전트 오케스트레이션으로 전체 레포 감사 작업 개선 여지

부정적:

- 팀원이 `agy` CLI 사용법을 새로 익혀야 함
- 클로즈드소스 전환으로 기능 요청/패치 기여 경로가 막힘

향후 고려사항:

- Antigravity 기능 패리티가 계속 미달하면 대용량 분석 역할의 대체 도구 재평가
