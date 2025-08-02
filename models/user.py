import uuid
from models.db import db

class User (db.Model):
    __tablename__='user'
    id_user=db.Column(db.String(50), primary_key=True,unique=True, default=lambda: str(uuid.uuid4()))
    first_name=db.Column(db.String(50),nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email=db.Column(db.String(50), nullable=False)
    password=db.Column(db.String(50), nullable=False)
    username=db.Column(db.String(50), nullable=False)
    rol = db.Column(db.String(50), nullable=False)
    dni = db.Column(db.String(20), nullable=False)
    birthdate= db.Column(db.Date, nullable=False)
    age=db.Column(db.Integer, nullable=False)
    phone=db.Column(db.String(50), nullable=False)
    nationality=db.Column(db.String(50), nullable=False)
    province=db.Column(db.String(50), nullable=False)

    def __init__(self, first_name, last_name, email, password, username, rol, dni, birthdate, age, phone, nationality, province):
        self.first_name=first_name
        self.last_name=last_name
        self.email=email
        self.password=password
        self.username=username
        self.rol=rol
        self.dni=dni
        self.birthdate=birthdate
        self.age=age
        self.phone=phone
        self.nationality=nationality
        self.province=province

    def serialize(self):
        return{
            'id_user':self.id_user,
            'first_name':self.first_name,
            'last_name':self.last_name,
            'email':self.email,
            'password':self.password,
            'username':self.username,
            'rol':self.rol,
            'birthdate':self.birthdate,
            'age':self.age,
            'phone':self.phone,
            'nationality':self.nationality,
            'province':self.province
        }