from flask import Flask
from config.config import DATABASE_CONNECTION_URI
from models.db import db
from routes.routes_tourist_site import tourist_site

app = Flask(__name__)
app.register_blueprint(tourist_site)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_CONNECTION_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    from models.tourist_site import TouristSite
    db.create_all()

if __name__ == '__main__':

    app.run(debug=True)