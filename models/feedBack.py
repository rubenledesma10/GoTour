from models.db import db
from datetime import datetime
from models.user import User

#Guarda las fotos que acompañan un comentario o reseña.
class FeedbackPhoto(db.Model):
    __tablename__ = "feedback_photos"

    id_photo = db.Column(db.Integer, primary_key=True, autoincrement=True)
    filename = db.Column(db.String(255), nullable=False)
    id_feedback = db.Column(db.Integer, db.ForeignKey("feedback.id_feedback"), nullable=False)

#Esto permite acceder desde la foto al feedback al que pertenece y viceversa
    feedback = db.relationship("feedBack", backref=db.backref("photos", cascade="all, delete-orphan"))#si se borra el feedback, también se borran sus fotos 

    def serialize(self):
        return {
            "id_photo": self.id_photo,
            "filename": self.filename,
            "url": f"/static/uploads/{self.filename}"#Creamos la URL para poder mostrar la foto desde Flask
        }


class feedBack(db.Model):
    __tablename__ = "feedback"

    id_feedback = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_hour = db.Column(db.DateTime, default=datetime.utcnow)
    comment = db.Column(db.String(250), nullable=True)
    qualification = db.Column(db.Integer, nullable=False)

    #foreign Keys
    id_user = db.Column(db.String(50), db.ForeignKey("user.id_user"), nullable=False)
    id_tourist_site = db.Column(db.String(50), db.ForeignKey("tourist_site.id_tourist_site"), nullable=False)

    #relaciones
    user = db.relationship("User", backref="feedbacks")
    tourist_site = db.relationship("TouristSite", backref="feedbacks")

    #campos de respuesta del admin (Guardan la respuesta del administrador, cuándo respondió, y su nombre)
    admin_response = db.Column(db.String(250), nullable=True)
    response_date = db.Column(db.DateTime, nullable=True)
    admin_name = db.Column(db.String(100), nullable=True)
    
    is_approved = db.Column(db.Boolean, default=True)
    is_deleted = db.Column(db.Boolean, default=False)

    def __init__(self, comment, qualification, id_user, id_tourist_site, date_hour=None,is_approved=False):
        self.date_hour = date_hour or datetime.utcnow()
        self.comment = comment
        self.qualification = qualification
        self.id_user = id_user
        self.id_tourist_site = id_tourist_site
        self.is_approved = is_approved

    def serialize(self):
        # Busca al admin actual por su nombre para obtener la foto más reciente
        admin_user = None
        if self.admin_name:
            admin_user = User.query.filter_by(username=self.admin_name).first()

        return {
            "id_feedback": self.id_feedback,
            "date_hour": self.date_hour.isoformat() if self.date_hour else None,
            "comment": self.comment,
            "qualification": self.qualification,

            # Usuario que dejó el feedback
            "user": {
                "id": self.user.id_user if self.user else None,
                "username": self.user.username if self.user else None,
                "photo": self.user.photo if self.user and self.user.photo else None
            },

            # Sitio turístico
            "tourist_site": {
                "id": self.tourist_site.id_tourist_site if self.tourist_site else None,
                "name": self.tourist_site.name if self.tourist_site else None
            },

            # Respuesta del admin
            "admin_response": self.admin_response,
            "response_date": self.response_date.isoformat() if self.response_date else None,
            "admin_name": self.admin_name,

            # Foto del admin actualizada dinámicamente
            "admin_photo": admin_user.photo if admin_user and admin_user.photo else None,

            #  Fotos adjuntas al feedback
            "photos": [p.serialize() for p in self.photos] if self.photos else [],

            "is_approved": self.is_approved,
            "is_deleted" : self.is_deleted
        }
