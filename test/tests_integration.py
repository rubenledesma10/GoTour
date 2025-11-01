import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import app
from models.db import db
from models.user import User

@pytest.fixture
def user():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  
    app.config["SECRET_KEY"] = "testsecret"

    with app.app_context():
        db.create_all()

        admin = User( # creamos un admin de prueba nuevo
            first_name="Luciano",
            last_name="Gomez",
            email="admin_luciano@test.com",
            password="adminstrong",
            username="admin_luciano_gomez",
            role="admin",
            dni="91234567",
            birthdate="1995-03-12",
            photo=None,
            phone="1145567788",
            nationality="Argentina",
            province="Buenos Aires",
            gender="male",
            is_activate=True
        )
        admin.set_password("adminstrong")
        db.session.add(admin)
        db.session.commit()

        yield app.test_client() # devolvemos un user para hacer las requests
        db.drop_all()


def test_full_flow(user): # test completo

    tourist_data = { # datos de un turista nuevo de prueba
        "first_name": "Mariana",
        "last_name": "Fernandez",
        "email": "mariana.fernandez@example.com",
        "password": "turista789",
        "username": "marifer23",
        "role": "tourist",
        "dni": "48392017",
        "birthdate": "2002-09-05",
        "phone": "1156678899",
        "nationality": "Argentina",
        "province": "Santa Fe",
        "gender": "female"
    }

    res = user.post("/api/gotour/register", data=tourist_data) # registramos el turista
    assert res.status_code == 201 # si devuelve un 201 está creado

    # login con el turista registrado
    res = user.post("/api/gotour/login", json={"email": "mariana.fernandez@example.com", "password": "turista789"})
    assert res.status_code == 200
    assert res.json.get("token") is not None # comprobamos que se pueda iniciar sesión y recibimos el token

    # login como admin para hacer operaciones CRUD
    res = user.post("/api/gotour/login", json={"email": "admin_luciano@test.com", "password": "adminstrong"})
    assert res.status_code == 200

    admin_token = res.json["token"]
    headers = {"Authorization": f"Bearer {admin_token}"} # pasamos el token por los headers

    create_data = { # creamos un usuario como administrador
        "first_name": "Ignacio",
        "last_name": "Lopez",
        "email": "ignacio.lopez@example.com",
        "password": "pass456",
        "username": "ignacio_l",
        "role": "tourist",
        "dni": "56473829",
        "birthdate": "2001-11-20",
        "phone": "1167788990",
        "nationality": "Argentina",
        "province": "Mendoza",
        "gender": "male"
    }

    res = user.post("/api/admin/add", data=create_data, headers=headers)
    assert res.status_code == 201

    res = user.get("/api/admin/get", headers=headers) # admin consulta usuarios
    assert res.status_code == 200

    users_emails = [u["email"] for u in res.json] # revisamos si el usuario recién creado aparece en la lista
    assert "ignacio.lopez@example.com" in users_emails
