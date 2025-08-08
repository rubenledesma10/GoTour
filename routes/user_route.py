from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models.db import db
from models.user import User
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from dtos.user_dto import UserRegisterDTO
from marshmallow import Schema, fields, ValidationError

user_bp = Blueprint('user_bp', __name__, url_prefix='/api/user')

@user_bp.route('/register', methods=['POST'])
def register():
    data=request.get_json() #obtenemos el body del json
    userDTO= UserRegisterDTO()
    try:
        validated_data=userDTO.load(data) #valida y convierte tipos. si falla, devuelve 400 con los errores.
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    user = User( #aca registramos el nuevo usuario
        first_name=validated_data['first_name'],
        last_name=validated_data['last_name'],
        email=validated_data['email'],
        password=validated_data['password'],
        username=validated_data['username'],
        rol=RoleEnum(validated_data['rol']), #convertimos la cadena en una instancia del rolesEnum
        dni=validated_data['dni'],
        birthdate=validated_data['birthdate'],
        photo=validated_data.get('photo', None),
        phone=validated_data['phone'],
        nationality=validated_data['nationality'],
        province=validated_data['province'],
        is_activate=validated_data.get('is_activate',True)
    )

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback() 
        if "email" in str(e.orig):
            return jsonify({"error": "Email is already registered"}), 400
        elif "dni" in str(e.orig):
            return jsonify({"error": "DNI is already registered"}), 400
        elif "username" in str(e.orig):
            return jsonify({"error": "Username is already taken"}), 400
        else:
            return jsonify({"error": "A record with these details already exists"}), 400
    return jsonify(user.serialize()), 201


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

def calculate_age(date_birth_str): #funcion para calcular la edad a traves de la fecha de nacimiento
    date_birth = datetime.strptime(date_birth_str, "%Y-%m-%d").date()
    today = date.today()
    age = today.year - date_birth.year - ((today.month, today.day) < (date_birth.month, date_birth.day))
    return age

@user_bp.route('/add', methods=['POST'])
def add_user():
    data=request.get_json()
    required_fields=['first_name','last_name','email','password','username','rol','dni','birthdate','age','phone','nationality','province','is_activate']
    if not data or not all(key in data for key in required_fields):
        return jsonify({'error':'Required data is missing'}),400
    for field in required_fields:
        if not str(data.get(field, '')).strip():  
            return jsonify({'error': f'{field.title()} is required and cannot be empty'}), 400
    try:
        print(f"Data received: {data}")
        age_calculate = calculate_age(data['birthdate'])
        first_name=data['first_name']
        last_name=data['last_name']
        email=data['email']
        password=data['password']
        username=data['username']
        rol=data['rol']
        dni=data['dni']
        birthdate=data['birthdate']
        age=int(data['age'])
        photo=data['photo']
        phone=data['phone']
        nationality=data['nationality']
        province=data['province']
        is_activate=data['is_activate']

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
            photo=photo,
            phone=phone,
            nationality=nationality,
            province=province,
            is_activate=is_activate
        )

        db.session.commit()
        db.session.add(new_user)
        return jsonify({
            'message':'User successfully created',
            'user':new_user.serialize()
        }),201
    except ValueError:
        db.session.rollback()
        return jsonify({'error':'Invalid data type. Ensure numeric fields are numbers.'},400)
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error: {e}")
        return jsonify({'error':'Error adding user'}),500
    
@user_bp.route('/delete/<string:id_user>', methods=['DELETE'])
def delete_user(id_user):
    user=User.query.get(id_user)
    if not user:
        return jsonify({'message':'User not found'}),404
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message':'User delete successfuly'}),200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}),500
    
@user_bp.route('/edit/<string:id_user>',methods=['PUT'])
def edit_user(id_user):
    data=request.get_json()
    if not data:
        return jsonify({'error':'No data received'}),400
    user=User.query.get(id_user)
    if not user:
        return jsonify({'error':'User not found'}),404
    required_fields=['first_name','last_name','email','password','username','rol','dni','birthdate','age','phone','nationality','province','is_activate']
    for field in required_fields:
        if not str(data.get(field, '')).strip():  
            return jsonify({'error': f'{field.title()} is required and cannot be empty'}), 400
    try:
        if 'first_name' in data:
            user.first_name=data['first_name']
        if 'last_name' in data:
            user.last_name=data['last_name']
        if 'email' in data:
            user.email=data['email']
        if 'password' in data:
            user.password=data['password']
        if 'username' in data:
            user.username=data['username']
        if 'rol' in data:
            user.rol=data['rol']
        if 'dni' in data:
            user.dni=data['dni']
        if 'birthdate' in data:
            user.birthdate=data['birthdate']
        if 'age' in data:
            user.age=int(data['age'])
        if 'phone' in data:
            user.phone=data['phone']
        if 'nationality' in data:
            user.nationality=data['nationality']
        if 'province' in data:
            user.province=data['province']
        if 'is_activate' in data:
            user.is_activate=data['is_activate']
        db.session.commit()
        return jsonify({'message':'User edited correctly','user':user.serialize()}),200
    except IntegrityError as e:
        db.session.rollback()
        print(f"IntegrityError: {e}")
        return jsonify({'error': 'Database integrity error: ' + str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
        
@user_bp.route('/update/<string:id_user>', methods=['PATCH'])
def update_user(id_user):
    data=request.get_json()
    if not data:
        return jsonify({'error':'No data received'}),400
    user=User.query.get(id_user)
    if not user:
        return jsonify({'error':'User not found'}),404
    try:
        if 'first_name' in data:
            user.first_name=data['first_name']
        if 'last_name' in data:
            user.last_name=data['last_name']
        if 'email' in data:
            user.email=data['email']
        if 'password' in data:
            user.password=data['password']
        if 'username' in data:
            user.username=data['username']
        if 'rol' in data:
            user.rol=data['rol']
        if 'dni' in data:
            user.dni=data['dni']
        if 'birthdate' in data:
            user.birthdate=data['birthdate']
        if 'age' in data:
            user.age=int(data['age'])
        if 'phone' in data:
            user.phone=data['phone']
        if 'nationality' in data:
            user.nationality=data['nationality']
        if 'province' in data:
            user.province=data['province']
        if 'is_activate' in data:
            user.is_activate=data['is_activate']
        db.session.commit()
        return jsonify({'message':'User edited correctly','user':user.serialize()}),200
    except IntegrityError as e:
        db.session.rollback()
        print(f"IntegrityError: {e}")
        return jsonify({'error': 'Database integrity error: ' + str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500