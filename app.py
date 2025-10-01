from flask import Flask, render_template, redirect, url_for
#from flask_login import LoginManager, login_required, logout_user, current_user
from config.config import Config
from models.db import db
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config.email_config import init_mail
from routes.user_route import user_bp
from routes.admin_route import admin_bp
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

# Inicializaciones
jwt = JWTManager(app)
init_mail(app)
db.init_app(app)
migrate = Migrate(app, db)

# Blueprints
app.register_blueprint(user_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(tourist_bp)
app.register_blueprint(recepcionist_bp)
app.register_blueprint(tourist_site)
app.register_blueprint(touristinfo_bp)
app.register_blueprint(cit_bp)
app.register_blueprint(feedback_bp, url_prefix="/api/feedback")

# Login Manager
# login_manager = LoginManager()
# login_manager.init_app(app)
# login_manager.login_view = "user_bp.login"

# @login_manager.user_loader
# def load_user(user_id):
#     return User.query.get(user_id)

# Rutas
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/feedback")
def feedback_page():
    """Página de comentarios (pública: cualquiera puede ver).
       Solo los logueados podrán comentar (lo valida el backend)."""
    sites = TouristSite.query.all()
    return render_template("feedBack/usuario.html", sites=sites)



# Crear tablas si no existen
with app.app_context():
    from models.user import User
    from models.cit import Cit
    from models.touristinfo import TouristInfo
    from models.feedBack import feedBack
    from models.tourist_site import TouristSite
    db.create_all()

if __name__ == '__main__':
    print("Ejecutando GoTour...")
    app.run(debug=True)
