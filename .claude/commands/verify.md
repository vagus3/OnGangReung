---
description: CI가 돌리는 검증을 로컬에서 전부 실행하고 결과만 간결히 보고
allowed-tools: Bash
---

`.github/workflows/deploy.yml`의 ci job과 같은 검사를 순서대로 돌린다.
목적은 "지금 push하면 CI가 통과하는가"를 push 전에 확정하는 것이다.

1. `pnpm verify`
   type-check(tsc + mypy), lint(eslint + ruff), test(vitest + pytest,
   커버리지 임계치 포함)를 turbo가 병렬로 돌린다.

2. codegen drift

   ```bash
   pnpm codegen
   git diff --exit-code packages/api-client/openapi.json packages/api-client/src/types.ts
   ```

3. 웹 빌드
   ```bash
   pnpm --filter web build
   ```

## 보고 형식

- 전부 통과하면 한 줄로 끝낸다. 통과한 검사를 나열하지 않는다.
- 실패하면 실패한 검사 이름과 원인이 되는 오류 줄만 인용한다.
  전체 로그를 붙여넣지 않는다.
- 고치라는 지시가 없으면 고치지 않는다. 무엇이 왜 깨졌는지만 보고한다.

> CAUTION: 2번은 파일을 수정한다. drift가 있었으면 워킹 트리가 바뀐 채로
> 남으므로, 어떤 파일이 갱신됐는지 반드시 알린다.

_Last Modified: 2026-08-30_
