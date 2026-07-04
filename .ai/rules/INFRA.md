# Infrastructure & Deployment Guide

<!-- 한국어 요약: 이 문서는 Docker, Kubernetes, Helm 배포 규칙을 정의합니다. AI 참고 목적으로 영문으로 작성되었습니다. -->

> This guide defines server deployment and maintenance guidelines using Docker and Kubernetes.
> Based on the 12-Factor App rules and GitOps workflows.

---

## Table of Contents

<!-- 한국어 요약: 목차 -->

1. [Architecture Overview](#1-architecture-overview)
2. [Docker — Containerization Strategy](#2-docker--containerization-strategy)
3. [Kubernetes — Cluster Structure](#3-kubernetes--cluster-structure)
4. [Helm — Package Management](#4-helm--package-management)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Deployment Strategy by Environment](#6-deployment-strategy-by-environment)
7. [Network & Ingress](#7-network--ingress)
8. [Secrets & Configurations](#8-secrets--configurations)
9. [Monitoring & Alerts](#9-monitoring--alerts)
10. [Logging Strategy](#10-logging-strategy)
11. [Scaling Strategy](#11-scaling-strategy)
12. [Disaster Recovery & Rollback](#12-disaster-recovery--rollback)
13. [Infrastructure Maintenance Checklist](#13-infrastructure-maintenance-checklist)

---

## 1. Architecture Overview

<!-- 한국어 요약: 인프라 전체 구조 아키텍처 개요 -->

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub                               │
│  [Code Push] → [Actions CI] → [Container Registry]          │
└─────────────────────────────┬───────────────────────────────┘
                              │ Push image
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                             │
│  ┌──────────┐  ┌───────────┐  ┌─────────────────────────┐  │
│  │   dev    │  │  staging  │  │      production          │  │
│  │namespace │  │ namespace │  │      namespace           │  │
│  └──────────┘  └───────────┘  └─────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Ingress Controller (Nginx)                          │   │
│  │  ├── web.example.com  → web Service                 │   │
│  │  └── api.example.com  → api Service                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Docker — Containerization Strategy

<!-- 한국어 요약: Docker 멀티스테이징 빌드 규칙 및 Dockerfile 설정 예시 -->

### Multi-stage Build Principles

Always separate build and runtime stages to minimize production image sizes and security footprints.

### apps/web Dockerfile (Next.js)

```dockerfile
# apps/web/Dockerfile

# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

# --- Stage 2: Build source ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter web build

# --- Stage 3: Production runner ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Image Tagging

```bash
# Format: {Registry}/{App}:{Branch}-{SHA7}
ghcr.io/org/web:main-a1b2c3d
ghcr.io/org/web:v1.2.3          # Release tag
```

---

## 3. Kubernetes — Cluster Structure

<!-- 한국어 요약: k8s 배포 매니페스트 및 리소스 제한, 헬스체크 설정 규칙 -->

### Deployment Manifest Example (api)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: api
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: api
          image: ghcr.io/org/api:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 4000
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health/live
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
```

---

## 4. Helm — Package Management

<!-- 한국어 요약: Helm 차트 구조 및 환경별 배포 명령어 가이드 -->

### Helm CLI Deployment

```bash
# Upgrade or install chart
helm upgrade --install api ./helm/charts/api \
  -n production \
  -f ./helm/charts/api/values-prod.yaml \
  --set image.tag=v1.2.4

# Rollback deployment
helm rollback api 1 -n production
```

---

## 5. CI/CD Pipeline

<!-- 한국어 요약: CI/CD 배포 파이프라인 트리거와 환경별 규칙 요약 -->

- Trigger: Branch push or PR merge. Refer to `.github/workflows/deploy.yml` for configuration.

---

## 6. Deployment Strategy by Environment

<!-- 한국어 요약: dev, staging, prod 환경별 트리거 기준 -->

- dev: Fast automatic deployments on branch push.
- staging: Automated regression tests on `main` merge.
- production: Tag triggers (`v*`) with mandatory reviewer approval.

---

## 7. Network & Ingress

<!-- 한국어 요약: Ingress 및 TLS 설정 가이드 -->

- Ingress uses Nginx Ingress Controller with TLS termination handled by `cert-manager`.

---

## 8. Secrets & Configurations

<!-- 한국어 요약: 시크릿 보관 규칙 및 외부 시크릿 매니저 연동 정보 -->

- Rule: Never commit actual credentials to Git. Use Kubernetes Secrets or External Secrets Operator integration.

---

## 9. Monitoring & Alerts

<!-- 한국어 요약: 프로메테우스 메트릭 수집 및 경고 임계값 정보 -->

- Scraping metrics via `/metrics` endpoint.
- Alerts trigger on P95 response times > 500ms or 5xx error rates > 1%.

---

## 10. Logging Strategy

<!-- 한국어 요약: Loki 연동을 위한 JSON 형식 로깅 가이드 -->

- Format logs as JSON using `pino` logger. Do not use raw text outputs.

```typescript
import pino from "pino";
export const logger = pino({ level: "info" });
logger.info({ userId: "123", action: "login" }, "User logged in successfully");
```

---

## 11. Scaling Strategy

<!-- 한국어 요약: HPA 수평 스케일링 규칙 -->

- Auto-scaling uses HPA targeting 70% CPU and 80% Memory utilization.

---

## 12. Disaster Recovery & Rollback

<!-- 한국어 요약: 장애 상황 롤백 및 디버깅 명령어 -->

```bash
# Immediate rollback commands
kubectl rollout undo deployment/api -n production
helm rollback api 2 -n production
```

---

## 13. Infrastructure Maintenance Checklist

<!-- 한국어 요약: 인프라 상시/월간 정기 정검 사항 -->

- Weekly cleanups of unused container images.
- Monthly upgrades of Helm dependencies and node patches.

---

_Last Modified: 2026-07-04_
_Refer to: ARCHITECTURE.md Section 13_
