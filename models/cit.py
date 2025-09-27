<<<<<<< HEAD
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy ()
=======
from models.db import db
>>>>>>> 719b5dd072e30671701b3e8c1d03586ad529e712

class Cit(db.Model):
    __tablename__ = "cit"

<<<<<<< HEAD
    id_cit = db.Column(db.Integer, primary_key= True)
    district = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String (100), nullable=False)
    is_activate = db.Column(db.Boolean, default=False)
    is_activate_qr_map = db.Column(db.Boolean, default=False)
    number_cit = db.Column(db.Integer, nullable=False) 

id_user = db.Column(db.Integer, db.foreingKey("user.id_user"), nullable= False)

def __init__(self, district, address, number_cit, id_user, is_activate=False, is_activate_qr_map=False):
    self.district = district
    self.address = address
    self.number_cit = number_cit
    self.id_user = id_user
    self.is_activate = is_activate
    self.is_activate_qr_map = is_activate_qr_map

def serialize(self):
    return {
        'id_cit':self.id_cit,
        'district': self.district,
        'address': self.address,
        'number_cit':self.number_cit,
        'id_user':self.id_user,
        'is_activate':self.is_activate,
        'is_activate_qr_map':self.is_activate_qr_map
=======
    id_cit = db.Column(db.Integer, primary_key=True)
    district = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(100), nullable=False)
    is_activate = db.Column(db.Boolean, default=False)
    is_activate_qr_map = db.Column(db.Boolean, default=False)
    number_cit = db.Column(db.Integer, nullable=False)
    id_user = db.Column(db.String(50), db.ForeignKey('user.id_user'), nullable=False)



    def serialize(self):
        return {
            "id_cit": self.id_cit,
            "district": self.district,
            "address": self.address,
            "number_cit": self.number_cit,
            "id_user": self.id_user,
            "is_activate": self.is_activate,
            "is_activate_qr_map": self.is_activate_qr_map
>>>>>>> 719b5dd072e30671701b3e8c1d03586ad529e712
        }