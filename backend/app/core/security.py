import base64
import binascii
import hashlib
import hmac
import os


PBKDF2_ITERATIONS = 120000
PBKDF2_SALT_BYTES = 16
HASH_PREFIX = "pbkdf2_sha256$"


def hash_password(password: str) -> str:
    salt = os.urandom(PBKDF2_SALT_BYTES)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    salt_text = base64.urlsafe_b64encode(salt).decode("ascii")
    key_text = base64.urlsafe_b64encode(derived_key).decode("ascii")
    return f"{HASH_PREFIX}{PBKDF2_ITERATIONS}${salt_text}${key_text}"


def verify_password(plain: str, hashed: str) -> bool:
    if not hashed.startswith(HASH_PREFIX):
        return False

    try:
        _, iterations_text, salt_text, key_text = hashed.split("$", 3)
        iterations = int(iterations_text)
        salt = base64.urlsafe_b64decode(salt_text.encode("ascii"))
        expected_key = base64.urlsafe_b64decode(key_text.encode("ascii"))
    except (ValueError, TypeError, binascii.Error):
        return False

    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        plain.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(derived_key, expected_key)