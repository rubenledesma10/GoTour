from models.db import db

class Cit(db.Model):
    __tablename__ = "cit"

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
        }