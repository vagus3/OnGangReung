#!/usr/bin/env bash
# =============================================================================
# worklog.sh — 커밋 직후 docs/WORKLOG.md에 한 줄 기록
#
# 등록 위치: .claude/settings.json → hooks.PostToolUse (matcher: Bash)
# 입력: stdin으로 훅 페이로드 JSON ({ tool_input: { command } })
#
# git commit이 아닌 Bash 호출은 즉시 통과시키고, 같은 해시가 이미
# 기록돼 있으면 중복 append하지 않는다.
# =============================================================================

set -uo pipefail

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0

case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
[ -n "$root" ] || exit 0

hash=$(git -C "$root" log -1 --format=%h 2>/dev/null) || exit 0
[ -n "$hash" ] || exit 0

log="$root/docs/WORKLOG.md"

# 이미 기록된 커밋이면 skip (--amend 등으로 훅이 두 번 도는 경우 대비)
if grep -q "($hash)" "$log" 2>/dev/null; then
  exit 0
fi

mkdir -p "$root/docs"
printf -- '- %s — %s (%s)\n' \
  "$(date '+%Y-%m-%d %H:%M')" \
  "$(git -C "$root" log -1 --format=%s)" \
  "$hash" >> "$log"
