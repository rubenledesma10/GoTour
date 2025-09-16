import uuid
from models.db import db
from enums.roles_enums import RoleEnum
from sqlalchemy import Enum as SqlEnum
from werkzeug.security import generate_password_hash, check_password_hash #generate hashea la contraseña, check compara contraseña escrita en el hash guardado
from datetime import datetime

class feedBack(db.Model):
    __tablename__ = "feedback"

    id_feedback = db.Column(db.Integer, primary_key = True, autoincrement = True)
    date_hour = db.Column(db.DateTime, default=datetime.utcnow)
    comment = db.Column(db.String(250), nullable = True)
    qualification = db.Column (db.Integer , nullable = True)
    tour_site = db.Column(db.String(50), nullable = False)

id_user = db.Column(db.Integer,db.ForeignKey("user.id_user"),nullable = False)
id_tourist_site = db.Column(db.Integer,db.ForeignKey("tourist_site.id_tourist_site"), nullable = False)

user = db.relationship("User", backref="feedbacks")
tourist_site = db.relationship("TouristSite", backref="feedbacks")