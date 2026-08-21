import pyotp

def generate_totp_secret() -> str:
    return pyotp.random_base32()

def get_provisioning_uri(secret: str, name: str, issuer_name: str = "Project 2029") -> str:
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=name, issuer_name=issuer_name)

def verify_totp_code(secret: str, code: str) -> bool:
    if not secret or not code:
        return False
    # Strip any whitespace
    clean_code = str(code).strip()
    totp = pyotp.TOTP(secret)
    # valid_window=1 allows +-30 seconds clock drift
    return totp.verify(clean_code, valid_window=1)
