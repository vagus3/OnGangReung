# =============================================================================
# apps/web Dockerfile — Next.js standalone (멀티스테이지)
# 빌드 컨텍스트는 모노레포 루트: docker build -f apps/web/Dockerfile .
# =============================================================================

# --- Stage 1: 의존성 설치 ---
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile --filter "web..."

# --- Stage 2: 빌드 ---
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/ ./
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter web build

# --- Stage 3: 프로덕션 실행 ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# standalone 출력은 모노레포 경로 구조를 유지한다 (apps/web/server.js)
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
