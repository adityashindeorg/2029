import sys
import os
import qrcode
import pyotp

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.auth.totp import get_provisioning_uri

def display_user_totp(name: str, email: str, secret: str):
    uri = get_provisioning_uri(secret, email, issuer_name="Project 2029")
    current_code = pyotp.TOTP(secret).now()

    print("\n" + "=" * 60)
    print(f"  AUTHENTICATOR SETUP FOR: {name} ({email})")
    print("=" * 60)
    print(f"  Secret Key (Manual Entry):  {secret}")
    print(f"  Provisioning URI:           {uri}")
    print(f"  Current Live Code (30s):    {current_code}")
    print("=" * 60)
    print("  Scan this QR Code in Google Authenticator / Authy:")
    print("-" * 60)
    
    qr = qrcode.QRCode()
    qr.add_data(uri)
    qr.print_ascii(invert=True)
    print("-" * 60)

def main():
    print("\n============================================================")
    print("        PROJECT 2029 — TOTP AUTHENTICATOR ENROLLMENT         ")
    print("============================================================")
    
    display_user_totp(
        name=settings.APPROVED_USER_1_NAME,
        email=settings.APPROVED_USER_1_EMAIL,
        secret=settings.APPROVED_USER_1_TOTP_SECRET
    )

    display_user_totp(
        name=settings.APPROVED_USER_2_NAME,
        email=settings.APPROVED_USER_2_EMAIL,
        secret=settings.APPROVED_USER_2_TOTP_SECRET
    )

if __name__ == "__main__":
    main()
