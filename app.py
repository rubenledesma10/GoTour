from flask import Flask
from config.config import DATABASE_CONNECTION_URI
from models.db import db
from routes.user_route import user_bp

app=Flask(__name__)
app.register_blueprint(user_bp)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_CONNECTION_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)



with app.app_context():
    from models.user import User
    db.create_all()

if __name__=='__main__':
    print("Ejecutando GoTour...")
    app.run(debug=True)