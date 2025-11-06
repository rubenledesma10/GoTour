from models.db import db

class TouristInfo(db.Model):
    __tablename__ = 'touristinfo'

    id_turist = db.Column(db.Integer, primary_key=True)
    nationality = db.Column(db.String(50), nullable=False)
    province = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    mobility = db.Column(db.String(100))
    person_with_disability = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)  # Borrado lógico
    id_user = db.Column(db.String(50), db.ForeignKey('user.id_user'), nullable=False)

    def __init__(self, nationality, province, quantity, mobility, person_with_disability, id_user):
        self.nationality = nationality
        self.province = province
        self.quantity = quantity
        self.mobility = mobility
        self.person_with_disability = person_with_disability
        self.id_user = id_user
        self.is_active = True  # Por defecto activo al crearse

    def serialize(self):
        return {
            "id_turist": self.id_turist,
            "nationality": self.nationality,
            "province": self.province,
            "quantity": self.quantity,
            "mobility": self.mobility,
            "person_with_disability": self.person_with_disability,
            "id_user": self.id_user,
            "is_active": self.is_active  # Para saber si está activo o no
        }
