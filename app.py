from flask import Flask, render_template
from flask_login import LoginManager,login_required
from config.config import Config
from models.db import db
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config.email_config import init_mail
from datetime import timedelta
from routes.user_route import user_bp
from routes.admin_route import admnin_bp
from routes.tourist_route import tourist_bp
from routes.receptionist_route import recepcionist_bp
from routes.tourist_site_route import tourist_site
from routes.routes_touristinfo import touristinfo_bp
from routes.routes_cit import cit_bp
from routes.feedBack_route import feedback_bp
from models.user import User
from models.tourist_site import TouristSite





app = Flask(__name__)
app.config.from_object(Config)
jwt = JWTManager(app) #inicializamos jwt en la aplicacion 
init_mail(app) #inicializamos correo
db.init_app(app) #inicializamos bd
migrate = Migrate(app, db)


app.register_blueprint(user_bp)
app.register_blueprint(admnin_bp)
app.register_blueprint(tourist_bp)
app.register_blueprint(recepcionist_bp)
app.register_blueprint(tourist_site)
app.register_blueprint(touristinfo_bp)
app.register_blueprint(cit_bp)
app.register_blueprint(feedback_bp, url_prefix="/api/feedback")

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "user_bp.login"


with app.app_context():
    from models.user import User
    from models.tourist_site import TouristSite
    from models.cit import Cit
    from models.touristinfo import TouristInfo
    from models.feedBack import feedBack
    db.create_all()

@app.route("/")
def home():
    return render_template("index.html")

# @app.route("/feedback")
# def feedback_page():
#     return render_template("feedBack/usuario.html")  # turista

@app.route("/admin/feedback")
def admin_feedback_page():
    return render_template("feedBack/administrador.html")  # admin

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id) 

@app.route("/feedback")
@login_required
def feedback_page():
    sites = TouristSite.query.all()  # traigo todos los sitios turísticos
    return render_template("feedBack/usuario.html", sites=sites)

if __name__=='__main__':
    print("Ejecutando GoTour...")
    app.run(debug=True)

