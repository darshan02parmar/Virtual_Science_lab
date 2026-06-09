from app.models.user import User
from app.core.security import verify_password, create_jwt_token

def authenticate_user(email: str, password: str):
    user = User.find_one({"email": email})
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta):
    return create_jwt_token(data, expires_delta)
