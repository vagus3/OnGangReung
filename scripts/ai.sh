#!/usr/bin/env bash
# =============================================================================
# ai.sh — AI 모델 실행 래퍼 스크립트
#
# 사용법:
#   bash scripts/ai.sh [모델명] [옵션]
#   bash scripts/ai.sh              # 기본 모델로 실행 (ai_config.json 참조)
#   bash scripts/ai.sh claude       # Claude 지정 실행
#   bash scripts/ai.sh gemini       # Gemini 지정 실행
#   bash scripts/ai.sh codex        # Codex 지정 실행
#   bash scripts/ai.sh --list       # 설치된 모델 확인
#
# 요구사항:
#   - claude: 'claude' CLI 설치 (claude.ai/cli)
#   - gemini: 'gemini' CLI 설치
#   - codex:  'codex' CLI 설치 (openai/codex)
# =============================================================================

set -euo pipefail

CONFIG_FILE=".ai/ai_config.json"

# 색상
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[AI]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ai_config.json에서 기본 모델 읽기
get_default_model() {
  if command -v jq &> /dev/null; then
    jq -r '.default' "$CONFIG_FILE"
  else
    grep '"default"' "$CONFIG_FILE" | sed 's/.*: *"\(.*\)".*/\1/'
  fi
}

# 모델의 CLI 커맨드 읽기
get_model_command() {
  local model=$1
  if command -v jq &> /dev/null; then
    jq -r ".models.${model}.command // empty" "$CONFIG_FILE"
  else
    echo "$model"
  fi
}

# 설치된 모델 목록 확인
list_models() {
  echo ""
  echo "AI 모델 설치 상태:"
  echo "------------------"
  for model in claude gemini codex; do
    CMD=$(get_model_command "$model")
    if command -v "$CMD" &> /dev/null; then
      echo -e "  ${GREEN}✓${NC} ${model} ($(command -v "$CMD"))"
    else
      echo -e "  ${RED}✗${NC} ${model} — '${CMD}' 명령어를 찾을 수 없음"
    fi
  done

  CURRENT=$(get_default_model)
  echo ""
  echo -e "기본 모델: ${GREEN}${CURRENT}${NC}"
  echo ""
  echo "전환: bash scripts/switch_model.sh [claude|gemini|codex]"
  echo ""
}

# --list 플래그 처리
if [ "${1:-}" = "--list" ]; then
  list_models
  exit 0
fi

# 모델 결정
if [ $# -gt 0 ] && [[ "$1" =~ ^(claude|gemini|codex)$ ]]; then
  TARGET_MODEL=$1
  shift  # 첫 번째 인자(모델명) 제거, 나머지는 CLI에 전달
else
  TARGET_MODEL=$(get_default_model)
fi

CMD=$(get_model_command "$TARGET_MODEL")

# CLI 명령어 존재 확인
if ! command -v "$CMD" &> /dev/null; then
  log_error "'${CMD}' CLI를 찾을 수 없습니다.

설치 방법:
  claude: https://claude.ai/cli
  gemini: npm install -g @google/gemini-cli
  codex:  npm install -g @openai/codex"
fi

# 실행
log_info "모델: ${TARGET_MODEL} (${CMD})"

# 프로젝트 컨텍스트 파일 목록 (자동 포함)
CONTEXT_FILES=(
  ".ai/rules/ARCHITECTURE.md"
  ".ai/core/MODEL_RULE.md"
)

# 모델별 추가 컨텍스트
case $TARGET_MODEL in
  claude) CONTEXT_FILES+=(".ai/core/CLAUDE.md") ;;
  gemini) CONTEXT_FILES+=(".ai/GEMINI.md") ;;
  codex)  CONTEXT_FILES+=(".ai/CODEX.md") ;;
esac

# CLI 실행 (추가 인자 전달)
exec "$CMD" "$@"
