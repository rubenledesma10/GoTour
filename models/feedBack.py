from models.db import db
from datetime import datetime

class feedBack(db.Model):
    __tablename__ = "feedback"

    id_feedback = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_hour = db.Column(db.DateTime, default=datetime.utcnow)
    comment = db.Column(db.String(250), nullable=True)
    qualification = db.Column(db.Integer, nullable=False)

    # 🔹 Foreign Keys
    id_user = db.Column(db.Integer, db.ForeignKey("user.id_user"), nullable=False)
    id_tourist_site = db.Column(db.Integer, db.ForeignKey("tourist_site.id_tourist_site"), nullable=False)

    # 🔹 Relaciones
    user = db.relationship("User", backref="feedbacks")
    tourist_site = db.relationship("TouristSite", backref="feedbacks")

    def __init__(self, comment, qualification, id_user, id_tourist_site, date_hour=None):
        self.date_hour = date_hour or datetime.utcnow()
        self.comment = comment
        self.qualification = qualification
        self.id_user = id_user
        self.id_tourist_site = id_tourist_site

    def serialize(self):
        return {
            "id_feedback": self.id_feedback,
            "date_hour": self.date_hour.isoformat(),
            "comment": self.comment,
            "qualification": self.qualification,
            "user_name": self.user.name if self.user else str(self.id_user),
            "tour_site": self.tourist_site.name if self.tourist_site else str(self.id_tourist_site)
        }
