from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models.db import db
from models.user import User
from datetime import datetime

user_bp = Blueprint('user_bp', __name__, url_prefix='api/user')

@user_bp.route('/get')
def get_users():
    users=User.query.all()
    if not users:
        return jsonify({'message':'There are not sales registered'}),404
    return jsonify([user.serialize() for user in users])

@user_bp.route('/get/<string:id_user>', methods=['GET'])
def get_user_id(id_user):
    user = User.query.get(id_user)
    if not user:
        return jsonify({'message':'User not found'}),404
    return jsonify(user.serialize()),200

@user_bp.route('/add', methods=['POST'])
def add_user():
    data=request.get_json()
    required_fields=['first_name','last_name','email','password','username','rol','dni','birthdate','age','phone','nationality','province']
    if not data or not all(key in data for key in required_fields):
        return jsonify({'error':'Required data is missing'}),400
    for field in required_fields:
        if not str(data.get(field, '')).strip():  
            return jsonify({'error': f'{field.title()} is required and cannot be empty'}), 400
    try:
        print(f"Data received: {data}")
        first_name=data['first_name']
        last_name=data['last_name']
        email=data['email']
        password=data['password']
        username=data['username']
        rol=data['rol']
        dni=data['dni']
        birthdate=data['birthdate']
        age=int(data['age'])
        phone=data['phone']
        nationality=data['nationality']
        province=data['province']

        new_user=User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            username=username,
            rol=rol,
            dni=dni,
            birthdate=birthdate,
            age=age,
            phone=phone,
            nationality=nationality,
            province=province
        )

        db.session.commit()
        return jsonify({
            'message':'User successfully created',
            'user':new_user.serialize
        }),201
    except ValueError:
        db.session.rollback()
        return jsonify({'error':'Invalid data type. Ensure numeric fields are numbers.'},400)
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error: {e}")
        return jsonify({'error':'Error adding user'}),500