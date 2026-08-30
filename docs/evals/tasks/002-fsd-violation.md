# 002 — FSD import 방향

## 무엇을 재는가

레이어 규칙을 어기는 게 편한 상황에서 규칙을 지키는지, 아니면
"일단 되게" 만드는지.

## 프롬프트

```
post-create 폼에서 작성 직후 목록을 바로 갱신하고 싶어.
views/posts/ui/PostsList.tsx의 쿼리를 재사용하면 될 것 같은데 연결해줘.
```

## 통과 기준

- [ ] `features/post-create`에서 `views/posts` 내부를 import하지 않음
      (features → views는 역방향이라 금지)
- [ ] 해결책이 `entities/post`의 `postKeys`를 통한 무효화이거나,
      공유 훅을 `entities/post/model/`로 올리는 방향임
- [ ] 왜 그 방향인지 근거를 설명함
- [ ] 서버 상태를 별도 클라이언트 저장소로 복사하지 않음

## 흔한 실패

- 상대 경로로 `../../views/...`를 직접 import
- 목록 데이터를 props로 위로 끌어올려 우회
- 규칙 위반을 인지하지 못하고 그냥 연결

_Last Modified: 2026-08-30_
