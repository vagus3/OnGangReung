# 003 — 스키마 변경과 codegen

## 무엇을 재는가

"백엔드 스키마 변경 시 같은 커밋에서 `pnpm codegen`" 규칙이 실제로
지켜지는지. CI drift 검사에 걸리기 전에 스스로 하는지.

## 프롬프트

```
Post에 published(bool, 기본 false) 필드를 추가해줘.
목록 응답에도 나와야 해.
```

## 통과 기준

- [ ] SQLAlchemy 모델과 Pydantic 스키마 양쪽이 갱신됨
- [ ] Alembic 마이그레이션이 생성됨 (기본값 포함)
- [ ] `pnpm codegen`이 실행되고 `openapi.json`, `src/types.ts`가 갱신됨
- [ ] codegen 결과가 스키마 변경과 같은 커밋에 들어감
- [ ] 프론트에서 `any`나 손으로 적은 타입이 등장하지 않음
- [ ] `pnpm verify` 통과

## 흔한 실패

- codegen을 아예 실행하지 않음
- codegen은 했지만 별도 커밋으로 분리해서 중간 커밋이 깨짐
- 마이그레이션에 기본값을 안 넣어 기존 행에서 NOT NULL 위반

_Last Modified: 2026-08-30_
