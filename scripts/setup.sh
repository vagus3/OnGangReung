#!/usr/bin/env bash
# =============================================================================
# setup.sh — 프로젝트 초기 설정 스크립트
#
# 사용법:
#   bash scripts/setup.sh [--skip-env] [--skip-db]
#
# 옵션:
#   --skip-env  .env 파일 생성 건너뜀
#   --skip-db   DB 마이그레이션/시드 건너뜀
# =============================================================================

set -euo pipefail

# 색상 출력 헬퍼
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 옵션 파싱
SKIP_ENV=false
SKIP_DB=false
for arg in "$@"; do
  case $arg in
    --skip-env) SKIP_ENV=true ;;
    --skip-db)  SKIP_DB=true ;;
  esac
done

echo ""
echo "==========================================="
echo "  SHG Template — Project Setup"
echo "==========================================="
echo ""

# 1. Node.js 버전 확인
log_info "Node.js 버전 확인..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  log_error "Node.js 20 이상이 필요합니다. 현재: $(node -v)"
fi
log_success "Node.js $(node -v)"

# 2. pnpm 확인
log_info "pnpm 확인..."
if ! command -v pnpm &> /dev/null; then
  log_warn "pnpm이 없습니다. 설치 중..."
  npm install -g pnpm
fi
log_success "pnpm $(pnpm -v)"

# 3. 의존성 설치
log_info "의존성 설치 중..."
pnpm install --frozen-lockfile
log_success "의존성 설치 완료"

# 4. 환경변수 파일 설정
if [ "$SKIP_ENV" = false ]; then
  log_info "환경변수 파일 설정..."

  # .env.example → .env 복사 (이미 있으면 건너뜀)
  if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    log_success ".env 파일 생성됨 (.env.example 기반)"
    log_warn ".env 파일을 열어 값을 입력해주세요"
  elif [ -f ".env" ]; then
    log_info ".env 파일이 이미 존재합니다 (건너뜀)"
  else
    log_warn ".env.example 파일이 없습니다. 수동으로 .env를 생성해주세요"
  fi
fi

# 5. Git hooks 설치 (husky)
log_info "Git hooks 설정 중..."
if [ -f "package.json" ] && grep -q '"prepare"' package.json; then
  pnpm prepare 2>/dev/null || true
  log_success "Git hooks (husky) 설치 완료"
fi

# 6. DB 마이그레이션
if [ "$SKIP_DB" = false ]; then
  log_info "데이터베이스 마이그레이션 확인..."

  # DATABASE_URL 환경변수 확인
  if [ -f ".env" ] && grep -q "DATABASE_URL" .env; then
    # .env 로드
    export $(grep -v '^#' .env | xargs) 2>/dev/null || true

    if [ -n "${DATABASE_URL:-}" ]; then
      log_info "Prisma 마이그레이션 실행 중..."
      pnpm --filter database migrate deploy 2>/dev/null && \
        log_success "마이그레이션 완료" || \
        log_warn "마이그레이션 실패 (DB 연결 확인 필요)"

      log_info "시드 데이터 실행 중..."
      pnpm --filter database seed 2>/dev/null && \
        log_success "시드 완료" || \
        log_warn "시드 실패 (선택사항이므로 계속)"
    else
      log_warn "DATABASE_URL이 설정되지 않아 DB 설정을 건너뜁니다"
    fi
  else
    log_warn "DATABASE_URL을 찾을 수 없어 DB 설정을 건너뜁니다"
  fi
fi

# 7. 완료
echo ""
echo "==========================================="
log_success "프로젝트 설정 완료!"
echo ""
echo "다음 명령어로 개발 서버를 시작하세요:"
echo "  pnpm dev"
echo ""
echo "AI 모델 전환:"
echo "  bash scripts/switch_model.sh [claude|gemini|codex]"
echo "==========================================="
echo ""
