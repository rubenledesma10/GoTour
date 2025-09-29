from models.db import db 
import uuid

class TouristSite(db.Model):
    __tablename__ = "tourist_site"

    id_tourist_site = db.Column(db.String(50), primary_key=True, unique=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(250), nullable=False)
    address = db.Column(db.String(50), unique=True, nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(250), unique=True, nullable=False)
    average = db.Column(db.Float, nullable=True)
    opening_hours = db.Column(db.Time, nullable=True)
    closing_hours = db.Column(db.Time, nullable=True)
    id_user = db.Column(db.String(50), db.ForeignKey('user.id_user'), nullable=False)
    user = db.relationship('User', backref='tourist_sites', lazy=True)
    is_activate = db.Column(db.Boolean, default=True, nullable=False)


def __init__(self, name, description, address, phone, category, url, id_user, average=None, is_activate=True): 
        
    self.name = name
    self.description = description
    self.address = address
    self.phone = phone 
    self.category = category
    self.url = url
    self.average = average
        #Estableci None por defecto a average para luego sacar un promedio de las visitas y calificaciones del lugar. 
    self.id_user = id_user
    self.is_activate = is_activate
    

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
            'opening_hours': self.opening_hours.strftime("%H:%M:%S") if self.opening_hours else None,
            'closing_hours': self.closing_hours.strftime("%H:%M:%S") if self.closing_hours else None,
            'id_user': self.id_user,
            'is_activate': self.is_activate
        }
