from models.db import db
from flask import url_for
import uuid

class TouristSite(db.Model):
    __tablename__ = "tourist_site"

    id_tourist_site = db.Column(db.String(50), primary_key=True, unique=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(250), nullable=False)
    address = db.Column(db.String(250), unique=True, nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(250), unique=True, nullable=False)
    photo = db.Column(db.String(250), nullable=True)
    average = db.Column(db.Float, nullable=True)              # Promedio de visitas
    average_rating = db.Column(db.Float, nullable=True, default=0)  # Promedio de calificaciones (estrellas)
    opening_hours = db.Column(db.Time, nullable=True)
    closing_hours = db.Column(db.Time, nullable=True)
    id_user = db.Column(db.String(50), db.ForeignKey('user.id_user'), nullable=False)
    user = db.relationship('User', backref='tourist_sites', lazy=True)
    is_activate = db.Column(db.Boolean, default=True, nullable=False)

    def serialize(self):
        return {
            'id_tourist_site': self.id_tourist_site,
            'name': self.name,
            'description': self.description,
            'address': self.address,
            'phone': self.phone,
            'category': self.category,
            'url': self.url,
            'average': self.average,
            'average_rating': round(self.average_rating or 0, 2), 
            'photo': url_for('static', filename=f'tourist_sites_images/{self.photo}', _external=True) if self.photo else None,
            'opening_hours': self.opening_hours.strftime("%H:%M:%S") if self.opening_hours else None,
            'closing_hours': self.closing_hours.strftime("%H:%M:%S") if self.closing_hours else None,
            'id_user': self.id_user,
            'is_activate': self.is_activate
        }
    
    def update_average_rating(self):
        # CALCULA el promedio de calificaciones basado en los feedbacks asociados. 
        if not self.feedbacks or len(self.feedbacks) == 0:
            self.average_rating = 0
        else:
            total = sum(f.qualification for f in self.feedbacks)
            count = len(self.feedbacks)
            self.average_rating = round(total / count, 2)
        db.session.commit()
