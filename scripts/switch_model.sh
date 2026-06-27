#!/usr/bin/env bash
# =============================================================================
# switch_model.sh — AI 기본 모델 전환 스크립트
#
# 사용법:
#   bash scripts/switch_model.sh [claude|gemini|codex]
#
# 예시:
#   bash scripts/switch_model.sh gemini   # Gemini를 기본 모델로 전환
#   bash scripts/switch_model.sh          # 현재 설정 확인
# =============================================================================

set -euo pipefail

CONFIG_FILE=".ai/ai_config.json"

# 색상
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 현재 모델 확인
get_current_model() {
  if command -v jq &> /dev/null; then
    jq -r '.default' "$CONFIG_FILE"
  else
    # jq 없을 때 grep으로 파싱
    grep '"default"' "$CONFIG_FILE" | sed 's/.*: *"\(.*\)".*/\1/'
  fi
}

# 인자 없으면 현재 상태 출력
if [ $# -eq 0 ]; then
  CURRENT=$(get_current_model)
  echo ""
  echo -e "${BLUE}현재 기본 AI 모델:${NC} ${GREEN}${CURRENT}${NC}"
  echo ""
  echo "전환 명령어:"
  echo "  bash scripts/switch_model.sh claude   # 아키텍처/복잡한 작업"
  echo "  bash scripts/switch_model.sh gemini   # 대용량 컨텍스트/문서화"
  echo "  bash scripts/switch_model.sh codex    # 보일러플레이트/테스트"
  echo ""
  exit 0
fi

TARGET_MODEL=$1

# 유효한 모델 확인
VALID_MODELS=("claude" "gemini" "codex")
IS_VALID=false
for m in "${VALID_MODELS[@]}"; do
  if [ "$TARGET_MODEL" = "$m" ]; then
    IS_VALID=true
    break
  fi
done

if [ "$IS_VALID" = false ]; then
  echo -e "\033[0;31m[ERROR]\033[0m 유효하지 않은 모델: $TARGET_MODEL"
  echo "사용 가능한 모델: claude, gemini, codex"
  exit 1
fi

CURRENT=$(get_current_model)

if [ "$CURRENT" = "$TARGET_MODEL" ]; then
  echo -e "${YELLOW}이미 ${TARGET_MODEL}이 기본 모델입니다.${NC}"
  exit 0
fi

# ai_config.json의 default 값 변경
if command -v jq &> /dev/null; then
  # jq 사용
  TMP=$(mktemp)
  jq --arg model "$TARGET_MODEL" '.default = $model' "$CONFIG_FILE" > "$TMP"
  mv "$TMP" "$CONFIG_FILE"
else
  # sed 사용 (jq 없을 때 fallback) — -i.bak 은 macOS/Linux 모두 동작
  sed -i.bak "s/\"default\": *\"[^\"]*\"/\"default\": \"$TARGET_MODEL\"/" "$CONFIG_FILE"
  rm -f "${CONFIG_FILE}.bak"
fi

echo ""
echo -e "${GREEN}기본 AI 모델이 전환됐습니다:${NC}"
echo -e "  ${CURRENT} → ${TARGET_MODEL}"
echo ""

# 모델별 사용 가이드 출력
case $TARGET_MODEL in
  claude)
    echo "Claude 사용 가이드:"
    echo "  - 아키텍처 설계 및 레이어 구조 결정"
    echo "  - 복잡한 리팩터링 및 디버깅"
    echo "  - 상세 가이드: .ai/core/CLAUDE.md"
    ;;
  gemini)
    echo "Gemini 사용 가이드:"
    echo "  - 대용량 코드베이스 분석"
    echo "  - 문서 생성 및 API 문서화"
    echo "  - 상세 가이드: .ai/GEMINI.md"
    ;;
  codex)
    echo "Codex 사용 가이드:"
    echo "  - 보일러플레이트 및 CRUD 코드 생성"
    echo "  - 단위 테스트 작성"
    echo "  - 상세 가이드: .ai/CODEX.md"
    ;;
esac
echo ""
