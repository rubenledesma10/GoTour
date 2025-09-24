import os
import json
from datetime import datetime
from app import app
from models.db import db
from models.user import User
from enums.roles_enums import RoleEnum

DATA_DIR = 'data'

def populate_users(data):
    created = 0
    for item in data:
        email = item.get('email')
        username = item.get('username')

        if not email or not username:
            continue

        # Verificar si ya existe usuario por email o username
        exists = User.query.filter(
            (User.email == email) | (User.username == username)
        ).first()

        if exists:
            print(f"Usuario ya existe: {email}")
            continue

        # Convertir birthdate de string a objeto date
        birthdate_str = item.get('birthdate')
        birthdate = None
        if birthdate_str:
            birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d").date()

        # Crear usuario
        user = User(
            first_name=item.get('first_name'),
            last_name=item.get('last_name'),
            email=email,
            password=item.get('password'),  # se hashea con set_password
            username=username,
            rol=RoleEnum[item.get('rol')],  # ADMIN / TOURIST / RECEPTIONIST
            dni=item.get('dni'),
            birthdate=birthdate,
            photo=item.get('photo'),
            phone=item.get('phone'),
            nationality=item.get('nationality'),
            province=item.get('province'),
            is_activate=item.get('is_activate', True)
        )

        db.session.add(user)
        created += 1

    return created


def populate_all():
    with app.app_context():
        print("Entrando en el contexto de la app...")
        for filename in os.listdir(DATA_DIR):
            if not filename.endswith('.json'):
                print(f"Archivo ignorado: {filename}")
                continue

            filepath = os.path.join(DATA_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                data = json.load(file)

            print(f"Datos cargados desde {filename}: {data}")

            if 'users' in filename:
                created = populate_users(data)
                print(f'{created} usuarios cargados desde {filename}')
            else:
                print(f'Se ignoró el archivo {filename}, tipo desconocido.')

        print("Haciendo commit a la base de datos...")
        db.session.commit()


if __name__ == '__main__':
    populate_all()
