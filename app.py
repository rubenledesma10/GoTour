#Importamos las librerias necesarias

from flask import Flask, render_template
from config.config import Config
from models.db import db
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config.email_config import init_mail

# Importamos los blueprints 
from routes.user_route import user_bp
from routes.admin_route import admnin_bp
from routes.tourist_route import tourist_bp
from routes.receptionist_route import recepcionist_bp
from routes.tourist_site_route import tourist_site

# Creamos la app
app = Flask(__name__)
app.config.from_object(Config)

# Inicializamos las extensiones en la app
jwt = JWTManager(app)
init_mail(app)
db.init_app(app)
migrate = Migrate(app, db)

# Registramos los blueprints
app.register_blueprint(user_bp)
app.register_blueprint(admnin_bp)
app.register_blueprint(tourist_bp)
app.register_blueprint(recepcionist_bp)
app.register_blueprint(tourist_site)

# Creamos las tablas en la base de datos dentro del contexto de la app
# with app.app_context():

#     db.create_all()
with app.app_context():
    try:
        from models.user import User
        from models.tourist_site import TouristSite
        db.create_all()
        print("Tablas creadas correctamente")
    except Exception as e:
        print("Error creando tablas:", e)

# Ruta principal
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == '__main__':
    print("Ejecutando GoTour...")
    app.run(debug=True)
