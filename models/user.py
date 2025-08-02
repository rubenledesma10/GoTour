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
    photo=db.Column(db.String(250), nullable=True)
    phone=db.Column(db.String(50), nullable=False)
    nationality=db.Column(db.String(50), nullable=False)
    province=db.Column(db.String(50), nullable=False)
    is_activate=db.Column(db.Boolean, default=True, nullable=False) 

    def __init__(self, first_name, last_name, email, password, username, rol, dni, birthdate, photo, phone, nationality, province,is_activate):
        self.first_name=first_name
        self.last_name=last_name
        self.email=email
        self.password=password
        self.username=username
        self.rol=rol
        self.dni=dni
        self.birthdate=birthdate
        self.photo=photo
        self.phone=phone
        self.nationality=nationality
        self.province=province
        self.is_activate=is_activate

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
            'photo':self.photo,
            'phone':self.phone,
            'nationality':self.nationality,
            'province':self.province,
            'is_activate':self.is_activate
        }