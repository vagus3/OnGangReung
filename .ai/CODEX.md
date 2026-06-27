# Codex Usage Guide

Codex는 반복적이고 패턴이 명확한 코드 생성에 특화된 보조 AI 모델입니다.
Claude가 아키텍처를 결정한 후, Codex가 구조에 맞는 코드를 생성하는 역할 분담이 핵심입니다.

---

## 역할 정의

Codex는 다음 작업에 우선 사용합니다:

| 작업 유형 | 구체적인 예시 |
|----------|-------------|
| 보일러플레이트 생성 | FSD 슬라이스 파일 구조 스캐폴딩 |
| 단순 CRUD | REST API 핸들러, Repository 메서드 |
| 단위 테스트 | 유틸 함수, hooks 테스트 케이스 작성 |
| 반복 패턴 | 여러 컴포넌트에 동일 패턴 적용 |
| 타입 생성 | API 응답 기반 TypeScript 타입 정의 |
| 설정 파일 | ESLint, tsconfig, vitest.config 등 |

---

## 효과적인 프롬프트 작성법

### Codex에게는 패턴을 명시한다

Codex는 컨텍스트를 적게 줘도 동작하지만, 기존 패턴을 참조로 주면 일관성이 높아집니다.

```
# Codex 요청 템플릿

참조 파일: [기존 동일 패턴의 파일 경로]

다음 [파일명]을 위 패턴과 동일하게 생성해주세요:
- 엔티티명: [예: Product]
- API 엔드포인트: [예: /api/products]
- 필드: [예: id, name, price, stock, createdAt]
```

### 스캐폴딩 요청 예시

```
# features/product 슬라이스를 아래 구조로 생성해주세요

참조 패턴: features/auth/ (첨부)

생성 대상:
- features/product/ui/ProductCard.tsx
- features/product/ui/ProductList.tsx
- features/product/model/product.store.ts
- features/product/model/product.hooks.ts
- features/product/api/product.api.ts
- features/product/index.ts

엔티티 타입 (entities/product/index.ts에서 import):
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: Date;
}

API:
- 목록: GET /api/products?page=1&size=20
- 단건: GET /api/products/:id
```

### CRUD 테스트 생성 요청 예시

```
# 아래 함수들에 대한 단위 테스트를 작성해주세요

참조 패턴: formatDate.test.ts (첨부)

대상 파일: shared/lib/formatCurrency.ts
[파일 내용 붙여넣기]

요구사항:
- Vitest 사용
- AAA 패턴 (Arrange-Act-Assert)
- 정상 케이스 + 엣지 케이스 (null, undefined, 0, 음수) 포함
- 테스트 설명은 한국어로
```

---

## Codex를 쓰지 않아야 할 때

| 상황 | 대신 사용 |
|------|----------|
| 아키텍처 결정이 필요한 작업 | Claude |
| 복잡한 비즈니스 로직 | Claude |
| 코드베이스 전체 맥락이 필요한 작업 | Gemini |
| 디버깅 | Claude |

---

## Codex 출력 검증 체크리스트

Codex가 생성한 코드는 반드시 아래를 확인합니다:

```
- [ ] FSD 레이어 규칙을 지키는가? (import 방향)
- [ ] index.ts를 통해서만 외부에 노출하는가?
- [ ] any 타입이 없는가?
- [ ] 에러 처리가 누락되지 않았는가?
- [ ] 네이밍 컨벤션(파일명, 변수명)이 맞는가?
```

---

*ai_config.json의 codex 설정과 연동됩니다.*
*최종 수정: 2026-06-27*
