#!/usr/bin/env bash
# =============================================================================
# pre-push-verify.sh — git push 직전 pnpm verify 강제
#
# 등록 위치: .claude/settings.json → hooks.PreToolUse (matcher: Bash)
# 입력: stdin으로 훅 페이로드 JSON ({ tool_input: { command } })
#
# 종료 코드:
#   0 — 통과 (push 진행)
#   2 — 차단. stderr 내용이 Claude에게 전달돼 실패 원인을 고치게 한다.
#
# 우회: 명령에 --no-verify를 붙이면 git 관례대로 검증을 생략한다.
# =============================================================================

set -uo pipefail

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0

case "$cmd" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

case "$cmd" in
  *--no-verify*) exit 0 ;;
esac

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

if output=$(pnpm verify 2>&1); then
  exit 0
fi

{
  echo "push를 차단했습니다: pnpm verify 실패."
  echo "아래 오류를 먼저 고친 뒤 다시 push하세요."
  echo "(의도적으로 건너뛰려면 git push --no-verify)"
  echo
  echo "$output" | tail -40
} >&2
exit 2
