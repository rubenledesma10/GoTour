from flask import Flask, render_template
from flask_migrate import Migrate
from config.config import DATABASE_CONNECTION_URI
from models.db import db
from routes.user_route import user_bp
from routes.admin_route import admnin_bp
from routes.tourist_route import tourist_bp
from routes.receptionist_route import recepcionist_bp
from flask_jwt_extended import JWTManager
from datetime import timedelta
from config.email_config import init_mail

app=Flask(__name__)
app.config['JWT_SECRET_KEY']='tu_clave_secreta' #definimos clave secreta para firmar los tokens
app.config["JWT_ACCESS_TOKEN_EXPIRES"]=timedelta(hours=1)
jwt=JWTManager(app) #inicializamos jwt en la aplicacion 
init_mail(app) #inicializamos correo
app.register_blueprint(user_bp)
app.register_blueprint(admnin_bp)
app.register_blueprint(tourist_bp)
app.register_blueprint(recepcionist_bp)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_CONNECTION_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)
migrate = Migrate(app, db)



with app.app_context():
    from models.user import User
    db.create_all()

@app.route("/")
def home():
    return render_template("index.html")

if __name__=='__main__':
    print("Ejecutando GoTour...")
    app.run(debug=True)
