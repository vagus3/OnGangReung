# Infrastructure & Deployment Guide

> Docker와 Kubernetes를 활용한 서버 배포 및 유지보수 관리 구조를 정의합니다.
> 12-Factor App 원칙과 GitOps 패턴을 기반으로 작성됐습니다.

---

## 목차

1. [전체 아키텍처 개요](#1-전체-아키텍처-개요)
2. [Docker — 컨테이너화 전략](#2-docker--컨테이너화-전략)
3. [Kubernetes — 클러스터 구조](#3-kubernetes--클러스터-구조)
4. [Helm — 패키지 관리](#4-helm--패키지-관리)
5. [CI/CD 파이프라인](#5-cicd-파이프라인)
6. [환경별 배포 전략](#6-환경별-배포-전략)
7. [네트워크 & 인그레스](#7-네트워크--인그레스)
8. [시크릿 & 설정 관리](#8-시크릿--설정-관리)
9. [모니터링 & 알림](#9-모니터링--알림)
10. [로깅 전략](#10-로깅-전략)
11. [스케일링 전략](#11-스케일링-전략)
12. [장애 대응 & 롤백](#12-장애-대응--롤백)
13. [유지보수 체크리스트](#13-유지보수-체크리스트)

---

## 1. 전체 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub                               │
│  [코드 Push] → [Actions CI] → [컨테이너 레지스트리]            │
└─────────────────────────────┬───────────────────────────────┘
                              │ 이미지 배포
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
│                                                             │
│  ┌──────────────┐  ┌─────────────────────────────────────┐ │
│  │  Prometheus  │  │  Grafana (메트릭 대시보드)            │ │
│  │  + Loki      │  │  + Alert Manager (알림)              │ │
│  └──────────────┘  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Docker — 컨테이너화 전략

### Multi-stage Build 원칙

빌드 단계와 실행 단계를 분리하여 최소한의 프로덕션 이미지 생성.

### apps/web Dockerfile (Next.js)

```dockerfile
# apps/web/Dockerfile

# ─── 1단계: 의존성 설치 ─────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 모노레포 루트 패키지 파일 복사 (캐시 최적화)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

# ─── 2단계: 빌드 ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 시 필요한 환경변수 (런타임 시크릿 제외)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter web build

# ─── 3단계: 프로덕션 실행 ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# 보안: root가 아닌 사용자로 실행
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물만 복사
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### apps/api Dockerfile (Node.js)

```dockerfile
# apps/api/Dockerfile

# ─── 1단계: 의존성 ──────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile --prod

# ─── 2단계: 빌드 (TypeScript 컴파일) ─────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm --filter api build

# ─── 3단계: 실행 ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 apiuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist

USER apiuser

EXPOSE 4000

# Graceful shutdown 지원
CMD ["node", "--enable-source-maps", "dist/main.js"]
```

### 이미지 태깅 전략

```bash
# 형식: {레지스트리}/{앱명}:{브랜치}-{SHA7}
ghcr.io/org/web:main-a1b2c3d
ghcr.io/org/web:staging-e4f5g6h
ghcr.io/org/web:v1.2.3          # 릴리즈 태그

# latest는 프로덕션 배포 완료 후에만 태그
ghcr.io/org/web:latest
```

### docker-compose (로컬 개발)

```yaml
# docker-compose.yml
version: '3.9'

services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: builder        # 개발 시 빌더 단계 사용
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:4000
    volumes:
      - ./apps/web:/app/apps/web  # 핫 리로드
    depends_on:
      - api

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: builder
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-myapp}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 3. Kubernetes — 클러스터 구조

### 네임스페이스 구성

```
cluster/
├── namespaces/
│   ├── dev/           # 개발 환경
│   ├── staging/       # 스테이징 환경
│   ├── production/    # 프로덕션 환경
│   └── monitoring/    # Prometheus, Grafana, Loki
├── cluster-wide/
│   ├── ingress-nginx/ # Ingress Controller
│   ├── cert-manager/  # TLS 인증서 자동화
│   └── rbac/          # 권한 관리
```

### Deployment 매니페스트 (api 예시)

```yaml
# k8s/base/api/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
    version: "1.0.0"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # 배포 중 추가 허용 Pod 수
      maxUnavailable: 0    # 배포 중 최소 가동 Pod 보장
  template:
    metadata:
      labels:
        app: api
    spec:
      # 그레이스풀 종료 시간 (기본 30초)
      terminationGracePeriodSeconds: 60

      # Pod 안티-어피니티: 노드 분산 배치
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: api
                topologyKey: kubernetes.io/hostname

      containers:
        - name: api
          image: ghcr.io/org/api:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 4000

          # 환경변수: ConfigMap + Secret 참조
          env:
            - name: NODE_ENV
              value: production
            - name: PORT
              value: "4000"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: database-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: jwt-secret

          # 리소스 제한
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"

          # 헬스체크: 준비 상태 (트래픽 수신 여부)
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 3

          # 헬스체크: 생존 상태 (재시작 여부)
          livenessProbe:
            httpGet:
              path: /health/live
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3

          # 시작 프로브: 초기 기동 시간 허용
          startupProbe:
            httpGet:
              path: /health/live
              port: 4000
            failureThreshold: 30
            periodSeconds: 5

          # 그레이스풀 종료
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 5"]
```

### Service & HPA

```yaml
# k8s/base/api/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 4000
  type: ClusterIP

---
# k8s/base/api/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## 4. Helm — 패키지 관리

### 디렉터리 구조

```
helm/
├── charts/
│   ├── web/
│   │   ├── Chart.yaml
│   │   ├── values.yaml           # 기본값
│   │   ├── values-dev.yaml       # dev 오버라이드
│   │   ├── values-staging.yaml   # staging 오버라이드
│   │   ├── values-prod.yaml      # production 오버라이드
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       ├── hpa.yaml
│   │       └── configmap.yaml
│   └── api/
│       └── ... (동일 구조)
```

### values.yaml 구조

```yaml
# helm/charts/api/values.yaml
replicaCount: 2

image:
  repository: ghcr.io/org/api
  tag: latest
  pullPolicy: Always

service:
  type: ClusterIP
  port: 80
  targetPort: 4000

ingress:
  enabled: true
  className: nginx
  host: api.example.com
  tls:
    enabled: true
    secretName: api-tls

resources:
  requests:
    cpu: "100m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

env:
  NODE_ENV: production
  PORT: "4000"

# 환경별 오버라이드 예시 (values-dev.yaml)
# replicaCount: 1
# resources.requests.cpu: "50m"
# autoscaling.enabled: false
```

### Helm 배포 명령어

```bash
# 설치 (첫 배포)
helm install api ./helm/charts/api \
  -n production \
  -f ./helm/charts/api/values-prod.yaml \
  --set image.tag=v1.2.3

# 업그레이드
helm upgrade api ./helm/charts/api \
  -n production \
  -f ./helm/charts/api/values-prod.yaml \
  --set image.tag=v1.2.4

# 롤백
helm rollback api 1 -n production

# 현재 릴리즈 목록
helm list -n production

# 릴리즈 히스토리
helm history api -n production
```

---

## 5. CI/CD 파이프라인

> `.github/workflows/deploy.yml` 참조

### 파이프라인 단계

```
PR 오픈         main 머지          git tag push
    │                │                   │
    ▼                ▼                   ▼
[CI 검증]      [dev 배포]         [prod 배포]
- lint          - 이미지 빌드      - 이미지 빌드 (태그)
- type-check    - staging 배포     - 승인 요청
- test          - smoke test       - production 배포
- build 확인                       - 배포 후 검증
```

---

## 6. 환경별 배포 전략

### 환경 정의

| 환경 | 트리거 | 승인 | 목적 |
|------|--------|------|------|
| dev | 브랜치 Push | 자동 | 기능 개발 중 빠른 확인 |
| staging | main 머지 | 자동 | QA, 통합 테스트, 클라이언트 검수 |
| production | `v*` 태그 | 수동 승인 필요 | 실제 서비스 |

### 블루-그린 배포 (프로덕션)

```yaml
# 배포 시: 새 버전(Green)을 기존(Blue)과 병행 실행
# 트래픽 전환 후 Blue 제거

# 1. Green 배포
kubectl apply -f deployment-green.yaml -n production

# 2. 헬스체크 통과 확인
kubectl rollout status deployment/api-green -n production

# 3. Service selector 변경 (트래픽 전환)
kubectl patch service api -n production \
  -p '{"spec":{"selector":{"version":"green"}}}'

# 4. Blue 제거
kubectl delete deployment api-blue -n production
```

---

## 7. 네트워크 & 인그레스

### Ingress 설정

```yaml
# k8s/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    # Rate limiting
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/limit-connections: "20"
    # TLS 인증서 자동 발급 (cert-manager)
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - example.com
        - api.example.com
      secretName: main-tls
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
```

---

## 8. 시크릿 & 설정 관리

### 원칙

- 시크릿은 절대 Git에 커밋하지 않는다
- 환경변수는 Kubernetes Secret 또는 외부 시크릿 스토어 사용
- ConfigMap: 민감하지 않은 설정값
- Secret: DB 비밀번호, JWT 키, API 키 등

### Kubernetes Secret 생성

```bash
# kubectl로 직접 생성 (CI/CD에서 사용)
kubectl create secret generic api-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="your-secret-key" \
  -n production

# 기존 시크릿 업데이트
kubectl create secret generic api-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="new-secret-key" \
  -n production \
  --dry-run=client -o yaml | kubectl apply -f -
```

### External Secrets Operator (권장)

```yaml
# 외부 시크릿 저장소(AWS Secrets Manager, GCP Secret Manager 등)와 연동
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: api-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: cluster-secret-store
    kind: ClusterSecretStore
  target:
    name: api-secrets
    creationPolicy: Owner
  data:
    - secretKey: database-url
      remoteRef:
        key: /production/api/database-url
    - secretKey: jwt-secret
      remoteRef:
        key: /production/api/jwt-secret
```

---

## 9. 모니터링 & 알림

### Prometheus 메트릭 수집

```yaml
# API 서버에서 /metrics 엔드포인트 노출 (prom-client 사용)
# k8s/monitoring/servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-monitor
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: api
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
```

### 핵심 모니터링 지표

| 카테고리 | 지표 | 임계값 |
|---------|------|--------|
| 응답 시간 | P95 응답 시간 | > 500ms 경고 |
| 에러율 | 5xx 응답 비율 | > 1% 경고 |
| CPU | Pod CPU 사용률 | > 80% 경고 |
| 메모리 | Pod 메모리 사용률 | > 85% 경고 |
| Pod 가용성 | Ready Pod 비율 | < 80% 긴급 |
| DB 연결 | 커넥션 풀 사용률 | > 80% 경고 |

### Grafana 대시보드 패널 구성

```
# 권장 대시보드 구성
1. Overview
   - 전체 요청 수 / 에러율 / 응답 시간 P95
   - Pod 상태 (Running / Pending / Failed)

2. API 성능
   - 엔드포인트별 응답 시간 히트맵
   - 상태코드별 요청 분포

3. 인프라
   - 노드별 CPU / 메모리 사용률
   - 네트워크 I/O

4. 데이터베이스
   - 쿼리 응답 시간
   - 커넥션 풀 상태
```

### AlertManager 알림 규칙

```yaml
# k8s/monitoring/alerts.yaml
groups:
  - name: api-alerts
    rules:
      # 높은 에러율 경고
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "API 에러율 5% 초과"
          description: "현재 에러율: {{ $value | humanizePercentage }}"

      # Pod 재시작 감지
      - alert: PodRestartingTooOften
        expr: |
          increase(kube_pod_container_status_restarts_total[1h]) > 5
        labels:
          severity: warning
        annotations:
          summary: "Pod 재시작 빈번: {{ $labels.pod }}"
```

---

## 10. 로깅 전략

### Loki + Promtail 스택

```yaml
# k8s/logging/promtail-config.yaml
# 모든 Pod 로그를 자동 수집
config:
  snippets:
    pipelineStages:
      - docker: {}
      - json:
          expressions:
            level: level
            message: message
            timestamp: timestamp
      - labels:
          level:
          app:
      - timestamp:
          source: timestamp
          format: RFC3339Nano
```

### 애플리케이션 로그 형식 (JSON 구조화)

```typescript
// shared/lib/logger.ts
// JSON 구조화 로그 — Loki에서 쿼리 최적화
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: process.env.SERVICE_NAME ?? 'api',
    env: process.env.NODE_ENV,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// 사용 예시
logger.info({ userId: '123', action: 'login' }, '사용자 로그인 성공');
logger.error({ err, requestId: '456' }, 'DB 연결 실패');
```

### 로그 레벨 가이드

| 레벨 | 사용 상황 |
|------|----------|
| `error` | 처리되지 않은 예외, 외부 서비스 오류 |
| `warn` | 예상 가능한 오류 (재시도 가능, deprecated 사용) |
| `info` | 중요 비즈니스 이벤트 (로그인, 주문 생성) |
| `debug` | 개발/디버깅 용도 (프로덕션 비활성화) |

---

## 11. 스케일링 전략

### 수평 스케일링 (HPA)

CPU/메모리 기반 자동 스케일링 → [3. Kubernetes 섹션](#3-kubernetes--클러스터-구조) 참조

### 수직 스케일링 (VPA) — 선택

```yaml
# 리소스 요청량 자동 최적화
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  updatePolicy:
    updateMode: "Auto"   # "Off"로 설정 시 추천만 제공
```

### 스케일 다운 보호

```yaml
# HPA에서 스케일 다운 속도 제한 (급격한 트래픽 변동 대응)
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300  # 5분간 안정화 후 스케일 다운
    policies:
      - type: Percent
        value: 50               # 한 번에 최대 50% 감소
        periodSeconds: 60
  scaleUp:
    stabilizationWindowSeconds: 0    # 스케일 업은 즉시
    policies:
      - type: Pods
        value: 2
        periodSeconds: 60
```

---

## 12. 장애 대응 & 롤백

### 롤백 절차

```bash
# 1. 현재 배포 상태 확인
kubectl rollout status deployment/api -n production
kubectl get pods -n production -l app=api

# 2. 이전 버전으로 즉시 롤백
kubectl rollout undo deployment/api -n production

# 3. 특정 버전으로 롤백
kubectl rollout history deployment/api -n production
kubectl rollout undo deployment/api --to-revision=3 -n production

# 4. Helm으로 롤백
helm rollback api 2 -n production

# 5. 롤백 후 상태 확인
kubectl rollout status deployment/api -n production
kubectl get pods -n production
```

### 장애 체크리스트

```markdown
## 장애 발생 시 즉시 확인

### 1. Pod 상태 확인
kubectl get pods -n production
kubectl describe pod [POD_NAME] -n production

### 2. 최근 로그 확인
kubectl logs -l app=api -n production --tail=100
kubectl logs -l app=api -n production --previous  # 이전 컨테이너 로그

### 3. 이벤트 확인
kubectl get events -n production --sort-by='.lastTimestamp' | tail -20

### 4. 리소스 사용량 확인
kubectl top pods -n production
kubectl top nodes

### 5. 서비스 연결 확인
kubectl exec -it [POD_NAME] -n production -- curl localhost:4000/health/ready
```

### PodDisruptionBudget (서비스 연속성 보장)

```yaml
# 업그레이드 / 노드 유지보수 시에도 최소 가용성 보장
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
spec:
  minAvailable: 1     # 최소 1개 Pod 항상 실행
  selector:
    matchLabels:
      app: api
```

---

## 13. 유지보수 체크리스트

### 일일 점검

```markdown
- [ ] Grafana 대시보드에서 에러율 및 응답 시간 확인
- [ ] AlertManager 미해결 알림 확인
- [ ] Pod 재시작 횟수 이상 여부 확인
```

### 주간 점검

```markdown
- [ ] 미사용 이미지 정리 (컨테이너 레지스트리)
- [ ] PersistentVolume 사용량 확인
- [ ] Node 리소스 사용률 추세 확인
- [ ] 보안 취약점 스캔 결과 확인 (Trivy)
```

### 월간 점검

```markdown
- [ ] Kubernetes 버전 업그레이드 계획 검토
- [ ] 노드 OS 보안 패치 적용
- [ ] 인증서 만료일 확인 (cert-manager 자동 갱신 동작 여부)
- [ ] 비용 최적화: 미사용 리소스 정리
- [ ] Helm 차트 의존성 업데이트
- [ ] 재해 복구 절차 시뮬레이션 (분기별)
```

### 이미지 보안 스캔

```bash
# Trivy로 이미지 취약점 스캔 (CI 파이프라인에 포함 권장)
trivy image ghcr.io/org/api:v1.2.3 \
  --severity HIGH,CRITICAL \
  --exit-code 1  # 취약점 발견 시 CI 실패
```

---

*최종 수정: 2026-06-27*  
*참조: ARCHITECTURE.md 섹션 13*
