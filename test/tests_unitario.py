import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import app
from models.db import db
from models.user import User
from datetime import date


app.config['TESTING'] = True #activamos el modo prueba en flask (para el manejo de errores mas explicito, no envia emails, etc)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///:memory:" #bd temporal en memoria para el test. Se crea al inicio del test y desp se elimina, de esta manera no tocamos la bd real

@pytest.fixture
def setup_db():
    with app.app_context():
        db.create_all() #crea las tablas
        yield #aca va el test que usa la bd
        db.drop_all() #borra las tablas al final para que no quede nada


def test_user_model_create(setup_db): #el parametro setup_db hace que se ejecute el fixture antes y despues el test
    user = User( #creamos la instancia de user
        first_name="Juan",
        last_name="Pérez",
        email="juanperez@example.com",
        password="password123",
        username="juanp",
        role="tourist",
        dni="12345678",
        birthdate=date(2000, 1, 1),
        photo=None,
        phone="1160000000",
        nationality="Argentina",
        province="Mendoza",
        is_activate=True,
        gender="male"
    )

    with app.app_context():
        db.session.add(user)
        db.session.commit() 

        saved = User.query.filter_by(email="juan@example.com").first() #buscamos el usuario

        assert saved is not None #verificamos que se creo el usuario
        assert saved.username == "juanp" #verificamos que le username se guardo correcamente
        assert saved.check_password("password123") is True  #verificamos que la contraseña hash funcione correctamente
        assert saved.role == "tourist"
        assert saved.dni == "12345678"
        assert saved.nationality == "Argentina"
