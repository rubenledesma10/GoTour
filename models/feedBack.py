<<<<<<< HEAD
from models.db import db
from datetime import datetime

class feedBack(db.Model):
=======
# from models.db import db
# from datetime import datetime

# class FeedBack(db.Model):
#     __tablename__ = "feedback"

#     id_feedback = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     date_hour = db.Column(db.DateTime, default=datetime.utcnow)
#     comment = db.Column(db.String(250), nullable=True)
#     qualification = db.Column(db.Integer, nullable=False)


#     id_user = db.Column(db.String(50), db.ForeignKey("user.id_user"), nullable=False)
#     id_turist = db.Column(db.Integer, db.ForeignKey("turist.id_turist"), nullable=False)

    
#     user = db.relationship("User", backref="feedbacks")
#     turist = db.relationship("Turist", backref="feedbacks")

#     def __init__(self, comment, qualification, id_user, id_turist, date_hour=None):
#         self.date_hour = date_hour or datetime.utcnow()
#         self.comment = comment
#         self.qualification = qualification
#         self.id_user = id_user
#         self.id_turist = id_turist

#     def serialize(self):
#         return {
#             "id_feedback": self.id_feedback,
#             "date_hour": self.date_hour,
#             "comment": self.comment,
#             "qualification": self.qualification,
#             "id_user": self.id_user,
#             "id_turist": self.id_turist
#         }

from models.db import db
from datetime import datetime

class FeedBack(db.Model):
>>>>>>> 719b5dd072e30671701b3e8c1d03586ad529e712
    __tablename__ = "feedback"

    id_feedback = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_hour = db.Column(db.DateTime, default=datetime.utcnow)
    comment = db.Column(db.String(250), nullable=True)
    qualification = db.Column(db.Integer, nullable=False)

<<<<<<< HEAD
    # 🔹 Foreign Keys
    id_user = db.Column(db.Integer, db.ForeignKey("user.id_user"), nullable=False)
    id_tourist_site = db.Column(db.Integer, db.ForeignKey("tourist_site.id_tourist_site"), nullable=False)

    # 🔹 Relaciones
    user = db.relationship("User", backref="feedbacks")
    tourist_site = db.relationship("TouristSite", backref="feedbacks")

    def __init__(self, comment, qualification, id_user, id_tourist_site, date_hour=None):
=======
    id_user = db.Column(db.String(50), db.ForeignKey("user.id_user"), nullable=False)
    id_turist = db.Column(db.Integer, db.ForeignKey("touristInfo.id_turist"), nullable=False)

    user = db.relationship("User", backref="feedbacks")
    turist = db.relationship("TouristInfo", backref="feedbacks")

    def __init__(self, comment, qualification, id_user, id_turist, date_hour=None):
>>>>>>> 719b5dd072e30671701b3e8c1d03586ad529e712
        self.date_hour = date_hour or datetime.utcnow()
        self.comment = comment
        self.qualification = qualification
        self.id_user = id_user
<<<<<<< HEAD
        self.id_tourist_site = id_tourist_site
=======
        self.id_turist = id_turist
>>>>>>> 719b5dd072e30671701b3e8c1d03586ad529e712

    def serialize(self):
        return {
            "id_feedback": self.id_feedback,
<<<<<<< HEAD
            "date_hour": self.date_hour.isoformat(),
            "comment": self.comment,
            "qualification": self.qualification,
            "user_name": self.user.name if self.user else str(self.id_user),
            "tour_site": self.tourist_site.name if self.tourist_site else str(self.id_tourist_site)
        }
=======
            "date_hour": self.date_hour,
            "comment": self.comment,
            "qualification": self.qualification,
            "id_user": self.id_user,
            "id_turist": self.id_turist
        }
>>>>>>> 719b5dd072e30671701b3e8c1d03586ad529e712
