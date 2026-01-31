from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    if data.username == "ccr" and data.password == "ccr123":
        return {
            "access_token": "fake-token",
            "role": "CCR"
        }

    raise HTTPException(status_code=401, detail="Credenciales inválidas")
