from models.db import db
from datetime import datetime

class FeedBack(db.Model):
    __tablename__ = "feedback"

    id_feedback = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_hour = db.Column(db.DateTime, default=datetime.utcnow)
    comment = db.Column(db.String(250), nullable=True)
    qualification = db.Column(db.Integer, nullable=False)

  
    id_user = db.Column(db.String(50), db.ForeignKey("user.id_user"), nullable=False)
    id_turist = db.Column(db.Integer, db.ForeignKey("turist.id_turist"), nullable=False)

    
    user = db.relationship("User", backref="feedbacks")
    turist = db.relationship("Turist", backref="feedbacks")

    def __init__(self, comment, qualification, id_user, id_turist, date_hour=None):
        self.date_hour = date_hour or datetime.utcnow()
        self.comment = comment
        self.qualification = qualification
        self.id_user = id_user
        self.id_turist = id_turist

    def serialize(self):
        return {
            "id_feedback": self.id_feedback,
            "date_hour": self.date_hour,
            "comment": self.comment,
            "qualification": self.qualification,
            "id_user": self.id_user,
            "id_turist": self.id_turist
        }
