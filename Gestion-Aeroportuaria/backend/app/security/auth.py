from app.security.roles import Role

# MOCK de usuarios (después va DB)
fake_users = {
    "ccr": {
        "username": "ccr",
        "password": "ccr123",
        "role": Role.CCR
    },
    "supervisor1": {
        "username": "supervisor1",
        "password": "sup123",
        "role": Role.SUPERVISOR
    },
    "cintero1": {
        "username": "cintero1",
        "password": "cin123",
        "role": Role.CINTERO
    }
}

def authenticate_user(username: str, password: str):
    user = fake_users.get(username)
    if not user:
        return None
    if user["password"] != password:
        return None
    return user

# ---- lo que esta arriba de esto es la logica de autenticacion
#----------------------------------------------------------------


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


# lo que esta arriba de esto es la creacion del endpoint /auth/login
#-----------------------------------------------------------------------

