#!/usr/bin/env bash
# =============================================================================
# stop-verify.sh — 턴을 마치기 전 미검증 소스 변경 차단
#
# 등록 위치: .claude/settings.json → hooks.Stop
# 입력: stdin으로 훅 페이로드 JSON ({ stop_hook_active })
#
# "다 됐습니다"로 끝내는데 실제로는 type-check/test가 깨져 있는 상황을 막는다.
# 커밋되지 않은 소스 변경(.ts/.tsx/.py)이 있을 때만 pnpm verify를 돌리므로
# 문서/설정만 고친 턴에는 아무 비용도 들지 않는다.
#
# 무한 루프 방지: stop_hook_active가 true면(이미 이 훅 때문에 이어서 도는 중)
# 그대로 통과시킨다. 최대 1회만 재시도를 강제한다.
# =============================================================================

set -uo pipefail

payload=$(cat)

active=$(printf '%s' "$payload" | jq -r '.stop_hook_active // false' 2>/dev/null) || active=false
if [ "$active" = "true" ]; then
  exit 0
fi

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

# WORKLOG는 커밋 직후 훅이 append하므로 항상 dirty — 판단에서 제외
changed=$(git status --porcelain -- . ':!docs/WORKLOG.md' 2>/dev/null | grep -E '\.(ts|tsx|py)$') || exit 0
[ -n "$changed" ] || exit 0

if output=$(pnpm verify 2>&1); then
  exit 0
fi

jq -n \
  --arg reason "커밋되지 않은 소스 변경이 있는데 pnpm verify가 실패합니다. 마치기 전에 고치세요.

$(printf '%s' "$output" | tail -30)" \
  --arg sys "pnpm verify 실패 — 미검증 소스 변경이 남아 있습니다." \
  '{decision:"block", reason:$reason, systemMessage:$sys}'
exit 0
