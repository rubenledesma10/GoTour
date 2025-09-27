import uuid
from models.db import db
from enums.roles_enums import RoleEnum
from sqlalchemy import Enum as SqlEnum
from werkzeug.security import generate_password_hash, check_password_hash #generate hashea la contraseña, check compara contraseña escrita en el hash guardado
from datetime import date

class User (db.Model):
    __tablename__='user'
    id_user=db.Column(db.String(50), primary_key=True,unique=True, default=lambda: str(uuid.uuid4()))
    first_name=db.Column(db.String(50),nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email=db.Column(db.String(50), nullable=False, unique=True)
    password_hash=db.Column(db.Text, nullable=False)
    username=db.Column(db.String(50), nullable=False, unique=True)
    role = db.Column(db.String(20), nullable=False)  
    dni = db.Column(db.String(20), nullable=False, unique=True)
    birthdate= db.Column(db.Date, nullable=False) #Marshmallow puede convertir strings "YYYY-MM-DD"
    photo=db.Column(db.String(250), nullable=True)
    phone=db.Column(db.String(50), nullable=False, unique=True)
    nationality=db.Column(db.String(50), nullable=False)
    province=db.Column(db.String(50), nullable=False)
    is_activate=db.Column(db.Boolean, default=True, nullable=False) 
    gender=db.Column(db.String(50), nullable=False)


    def set_password(self, password): #con esta funcion hasheamos y guardamos la contraseña 
        self.password_hash = generate_password_hash(password)

    def check_password(self, password): #con esta funcion validamos la contraseña ingresada
        return check_password_hash(self.password_hash, password)

    def __init__(self, first_name, last_name, email, password, username, role, dni, birthdate, photo, phone, nationality, province,is_activate, gender):
        self.first_name=first_name
        self.last_name=last_name
        self.email=email.lower()
        self.set_password(password)
        self.username=username
        self.role = role.lower()
        self.dni=dni
        self.birthdate=birthdate
        self.photo=photo
        self.phone=phone
        self.nationality=nationality
        self.province=province
        self.is_activate=is_activate
        self.gender=gender

    # def serialize(self):
    #     today = date.today()
    #     birthdate = self.birthdate
    #     age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    #     return{
    #         'id_user':self.id_user,
    #         'first_name':self.first_name,
    #         'last_name':self.last_name,
    #         'email':self.email,
    #         #'password':self.password,
    #         'username':self.username,
    #         'rol':self.rol.value,
    #         'dni':self.dni,
    #         'birthdate':self.birthdate,
    #         'age': age,
    #         'photo':self.photo,
    #         'phone':self.phone,
    #         'nationality':self.nationality,
    #         'province':self.province,
    #         'is_activate':self.is_activate
    #     }