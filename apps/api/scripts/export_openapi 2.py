"""FastAPI 앱에서 OpenAPI 스키마를 추출해 파일로 저장한다.

서버 기동 없이 앱 객체에서 직접 추출하므로 CI에서도 그대로 사용한다.
사용법: uv run python scripts/export_openapi.py <출력 경로>
"""

import json
import sys
from pathlib import Path

from app.main import app


def main() -> None:
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "openapi.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(app.openapi(), indent=2, ensure_ascii=False) + "\n")
    print(f"OpenAPI schema written to {out}")


if __name__ == "__main__":
    main()
