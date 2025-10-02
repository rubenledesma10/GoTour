from models.db import db

class Turist(db.Model):
    __tablename__ = "turist"

    id_turist = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nationality = db.Column(db.String(50), nullable=False)
    province = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    #mobility = db.Column(db.String(100), db.ForeignKey("mobility.name"), nullable=False)

    def __init__(self, nationality, province, quantity, mobility):
        self.nationality = nationality
        self.province = province
        self.quantity = quantity
        #self.mobility = mobility

    def serialize(self):
        return {
            "id_turist": self.id_turist,
            "nationality": self.nationality,
            "province": self.province,
            "quantity": self.quantity,
            #"mobility": self.mobility
        }
