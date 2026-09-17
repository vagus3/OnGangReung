"""비밀번호 해시와 세션 토큰.

암호 관련 원시 연산만 둔다. 도메인 규칙은 서비스가 갖는다.
"""

import hashlib
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError

_hasher = PasswordHasher()

SESSION_TOKEN_BYTES = 32


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        _hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError):
        return False
    return True


def new_session_token() -> str:
    """세션 토큰 원문. 사용자에게 한 번만 주고 우리는 해시만 갖는다."""
    return secrets.token_urlsafe(SESSION_TOKEN_BYTES)


def hash_session_token(token: str) -> str:
    """토큰은 무작위 고엔트로피라 느린 해시가 필요 없다 — sha256으로 충분하다.

    비밀번호와 달리 사전 공격 대상이 아니다.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
