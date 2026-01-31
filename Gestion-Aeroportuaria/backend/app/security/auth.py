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
    },
    "maletero1": {
        "username": "maletero1",
        "password": "mal123",
        "role": Role.MALETERO
    },
    "tractorista1": {
        "username": "tractorista1",
        "password": "trac123",
        "role": Role.TRACTORISTA
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


