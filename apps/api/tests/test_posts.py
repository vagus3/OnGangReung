from httpx import AsyncClient


async def test_create_and_list_posts(client: AsyncClient) -> None:
    res = await client.post("/api/v1/posts", json={"title": "hello", "content": "world"})
    assert res.status_code == 201
    body = res.json()
    assert body["title"] == "hello"
    assert body["content"] == "world"
    assert "id" in body
    assert "created_at" in body

    res = await client.get("/api/v1/posts")
    assert res.status_code == 200
    posts = res.json()
    assert len(posts) == 1
    assert posts[0]["title"] == "hello"


async def test_get_post_by_id(client: AsyncClient) -> None:
    created = (
        await client.post("/api/v1/posts", json={"title": "one", "content": "body"})
    ).json()

    res = await client.get(f"/api/v1/posts/{created['id']}")
    assert res.status_code == 200
    assert res.json()["title"] == "one"


async def test_get_missing_post_returns_404_with_error_schema(client: AsyncClient) -> None:
    res = await client.get("/api/v1/posts/999")
    assert res.status_code == 404
    body = res.json()
    assert body["code"] == "post_not_found"
    assert "detail" in body


async def test_create_post_rejects_empty_title(client: AsyncClient) -> None:
    res = await client.post("/api/v1/posts", json={"title": "", "content": "x"})
    assert res.status_code == 422


async def test_delete_post(client: AsyncClient) -> None:
    created = (await client.post("/api/v1/posts", json={"title": "t", "content": "c"})).json()

    res = await client.delete(f"/api/v1/posts/{created['id']}")
    assert res.status_code == 204

    res = await client.get(f"/api/v1/posts/{created['id']}")
    assert res.status_code == 404
