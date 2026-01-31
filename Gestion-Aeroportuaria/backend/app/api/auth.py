from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.security.auth import authenticate_user

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    role: str

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    user = authenticate_user(data.username, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    return {
        "access_token": "fake-jwt-token",
        "role": user["role"]
    }
