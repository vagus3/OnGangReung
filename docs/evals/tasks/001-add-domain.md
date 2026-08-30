# 001 — 도메인 추가

## 무엇을 재는가

`add-domain` 스킬이 실제로 작동하는지, 그리고 FSD 레이어 규칙과 codegen
규칙이 새 코드에도 적용되는지.

## 프롬프트

```
posts와 같은 구조로 comments 도메인을 추가해줘.
필드는 post_id(FK), author, body, created_at이고 목록 조회와 생성만 있으면 돼.
```

## 통과 기준

- [ ] 백엔드 파일이 `models` → `schemas` → `services` → `api/v1` 순서로 생성됨
- [ ] `app/models/__init__.py`에 새 모델 import와 `__all__` 등록이 됨
- [ ] `app/api/v1/router.py`에 라우터가 등록됨
- [ ] Alembic 마이그레이션이 생성되고 내용이 비어 있지 않음
- [ ] `pnpm codegen`이 실행되어 `packages/api-client`가 갱신됨
- [ ] 프론트 슬라이스마다 `index.ts` 공개 API가 있고, 다른 슬라이스가
      내부 경로를 직접 import하지 않음
- [ ] 커밋이 하나로 뭉치지 않고 최소 3개 이상으로 쪼개짐

## 흔한 실패

- `models/__init__.py` 등록을 빠뜨려 마이그레이션이 빈 파일로 생성됨
- codegen을 잊고 프론트에서 타입이 안 맞자 손으로 타입을 적음
- 전부 한 커밋에 몰아넣음

_Last Modified: 2026-08-30_
