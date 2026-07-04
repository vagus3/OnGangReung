#!/usr/bin/env bash
# =============================================================================
# ai.sh — AI CLI 실행 스크립트
#
# 사용법:
#   bash scripts/ai.sh                     # ai_config.json의 default 모델 실행
#   bash scripts/ai.sh claude              # 특정 모델 지정 실행
#   bash scripts/ai.sh antigravity
#   bash scripts/ai.sh codex
#   bash scripts/ai.sh --list              # 설정된 모델 목록/현재 기본값 출력
#
# 모델 뒤의 인자는 해당 CLI로 그대로 전달됩니다:
#   bash scripts/ai.sh claude --resume
# =============================================================================

set -euo pipefail

CONFIG_FILE="$(dirname "$0")/../.ai/ai_config.json"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

get_default_model() {
  if command -v jq &> /dev/null; then
    jq -r '.default' "$CONFIG_FILE"
  else
    grep '"default"' "$CONFIG_FILE" | sed 's/.*: *"\(.*\)".*/\1/'
  fi
}

get_command_for() {
  local model=$1
  if command -v jq &> /dev/null; then
    jq -r --arg m "$model" '.models[$m].command // empty' "$CONFIG_FILE"
  else
    # jq 없을 때: 모델 블록 다음에 나오는 첫 "command" 값을 추출
    awk -v m="\"$model\"" '$0 ~ m {found=1} found && /"command"/ {gsub(/.*: *"|".*/, ""); print; exit}' "$CONFIG_FILE"
  fi
}

list_models() {
  local default_model
  default_model=$(get_default_model)
  echo ""
  echo -e "${BLUE}현재 기본 모델:${NC} ${GREEN}${default_model}${NC}"
  echo ""
  echo "설정된 모델 (.ai/ai_config.json):"
  if command -v jq &> /dev/null; then
    jq -r '.models | to_entries[] | "  \(.key)\t→ \(.value.command)\t(\(.value.usage | join(", ")))"' "$CONFIG_FILE"
  else
    grep -o '"[a-z]*": *{' "$CONFIG_FILE" | sed 's/[":{ ]//g' | sed 's/^/  /'
  fi
  echo ""
  echo "기본 모델 전환: bash scripts/switch_model.sh [claude|antigravity|codex]"
  echo ""
}

# --list / -l 처리
if [ "${1:-}" = "--list" ] || [ "${1:-}" = "-l" ]; then
  list_models
  exit 0
fi

# 모델 결정: 인자 없으면 config의 default 사용
MODEL="${1:-$(get_default_model)}"
[ $# -gt 0 ] && shift

# gemini 하위 호환: Gemini CLI는 2026-06-18 서비스 중단 → antigravity로 안내
if [ "$MODEL" = "gemini" ]; then
  echo -e "${RED}[NOTE]${NC} Gemini CLI는 2026-06-18 서비스 중단됐습니다. antigravity(agy)로 실행합니다."
  MODEL="antigravity"
fi

CMD=$(get_command_for "$MODEL")

if [ -z "$CMD" ]; then
  echo -e "${RED}[ERROR]${NC} 알 수 없는 모델: $MODEL"
  echo "사용 가능한 모델: claude, antigravity, codex (bash scripts/ai.sh --list)"
  exit 1
fi

if ! command -v "$CMD" &> /dev/null; then
  echo -e "${RED}[ERROR]${NC} '$CMD' 명령을 찾을 수 없습니다. ($MODEL CLI가 설치되어 있는지 확인하세요)"
  exit 1
fi

exec "$CMD" "$@"
