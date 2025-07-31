from models.db import db 

class TouristSite (db.Model):
    __tablename__ = "tourist_site"

    id_tourist_site = db.Column (db.Integer,unique = True, primary_key = True)
    name = db.Column (db.String(50),unique = True, nullable = False)
    description = db.Column (db.String(250), nullable = False)
    address = db.Column(db.String(50), unique = True, nullable = False)
    phone = db.Column (db.String(50), nullable = False)
    category = db.Column (db.String(50),nullable = False)
    url = db.Column (db.String(250), unique = True, nullable = False)
    average = db.Column (db.Float, nullable = True)
    ###id_district = db.Column(db.Integer,db.ForeignKey('district.id_district'), nullable = False) 
    #id_district indica que cada TouristSite tendra un id_district que apunta a un distrito especifico
    #Nullable = False, ya que siempre un sitio turistico pertenece a un distrito.
    #id_district es la FK que apunta a la PK id_district en nuestra tabla 'district'
    ###district = db.relationship('District', backref = 'tourist_site', lazy = True)
    # `lazy=True`: Los datos del District se cargarán desde la DB 
    # solo cuando se acceda a `mi_sitio.district`.
    ###id_user = db.Column (db.Integer, db.ForeignKey('user.id_user'), nullable = False)
    #nullable = False, ya que cada TouristSite debe tener asociado un usuario, ya sea 
    #turista o administrador.
    ###user = db.relationship('User', backref = 'tourist_site', lazy = True)

    def __init__ (self, name,description,address,phone,category,url,average): #,id_user,id_district
        self.name = name
        self.description = description
        self.address = address
        self.phone = phone 
        self.category = category
        self.url = url
        self.average = average 
        #self.id_district = id_district
        #self.id_user = id_user
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
            #'id_district': self.id_district
        }