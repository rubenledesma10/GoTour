from models.db import db

class Cit(db.Model):
    __tablename__ = "cit"

    id_cit = db.Column(db.Integer, primary_key=True, autoincrement=True)
    number_cit = db.Column(db.Integer, unique=True, nullable=False)
    district = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(100), nullable=False)
    is_activate = db.Column(db.Boolean, default=False)
    is_activate_qr_map = db.Column(db.Boolean, default=False)
    id_user = db.Column(db.String(50), db.ForeignKey("user.id_user"), nullable=False)  # <-- cambiar a String

    def __init__(self, number_cit, district, address, id_user, is_activate=False, is_activate_qr_map=False):
        self.number_cit = number_cit
        self.district = district
        self.address = address
        self.id_user = id_user
        self.is_activate = is_activate
        self.is_activate_qr_map = is_activate_qr_map

    def serialize(self):
        return {
            "id_cit": self.id_cit,
            "number_cit": self.number_cit,
            "district": self.district,
            "address": self.address,
            "is_activate": self.is_activate,
            "is_activate_qr_map": self.is_activate_qr_map,
            "id_user": self.id_user
        }
