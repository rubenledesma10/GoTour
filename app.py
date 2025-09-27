from flask import Flask, render_template
from config.config import Config
from models.db import db
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config.email_config import init_mail

# Importamos los blueprints
from routes.user_route import user_bp
#from routes.admin_route import admin_bp
from routes.tourist_route import tourist_bp
from routes.receptionist_route import recepcionist_bp
from routes.tourist_site_route import tourist_site
from routes.feedBack_route import feedback_bp


from datetime import timedelta

app = Flask(__name__)

# Configuración de JWT
app.config['JWT_SECRET_KEY'] = 'tu_clave_secreta'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Inicializamos extensiones
jwt = JWTManager(app)
init_mail(app)

# Configuración de base de datos
app.config.from_object(Config)
db.init_app(app)
migrate = Migrate(app, db)

# Registramos blueprints
app.register_blueprint(user_bp)
#app.register_blueprint(admin_bp)
app.register_blueprint(tourist_bp)
app.register_blueprint(recepcionist_bp)
app.register_blueprint(tourist_site)
app.register_blueprint(feedback_bp, url_prefix="/api/feedback")

with app.app_context():
    from models.user import User
    from models.feedBack import feedBack
    from models.turist import Turist
    db.create_all()

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/feedback")
    def feedback_user_page():
        return render_template("feedBack/usuario.html")

    @app.route("/admin/feedback")
    def feedback_admin_page():
        return render_template("feedBack/administrador.html")


if __name__ == "__main__":
    print("Ejecutando GoTour...")
    app.run(debug=True)
