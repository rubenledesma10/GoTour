from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models.db import db
from models.user import User
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from dtos.user_register_dto import UserRegisterDTO
from dtos.user_login_dto import UserLoginDTO
from marshmallow import Schema, fields, ValidationError
from flask_jwt_extended import create_access_token, jwt_required
from utils.decorators import role_required

#ACA VAN A ESTAR TODAS LAS RUTAS EN LAS QUE EL ADMINISTRADOR PUEDE ACCEDER
admnin_bp = Blueprint('admnin_bp', __name__, url_prefix='/api/admin')

@admnin_bp.route("/welcome", methods=["GET"])
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def test_admin():
    return jsonify({"message":"Endpoint for admin "})

def calculate_age(date_birth_str): #funcion para calcular la edad a traves de la fecha de nacimiento
    date_birth = datetime.strptime(date_birth_str, "%Y-%m-%d").date()
    today = date.today()
    age = today.year - date_birth.year - ((today.month, today.day) < (date_birth.month, date_birth.day))
    return age

@admnin_bp.route('/get')
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def get_tourists():
    users=User.query.all()
    if not users:
        return jsonify({'message':'There are not users registered'}),404
    return jsonify([user.serialize() for user in users])

@admnin_bp.route('/get/<string:id_user>', methods=['GET'])
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def get_tourist_id(id_user):
    user = User.query.get(id_user)
    if not user:
        return jsonify({'message':'User not found'}),404
    return jsonify(user.serialize()),200


@admnin_bp.route('/add', methods=['POST'])
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def add_user():
    data = request.get_json()
    user_dto = UserRegisterDTO()

    try:
        validated_data = user_dto.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400
    try:
        new_user=User(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data['username'],
            rol=validated_data['rol'],
            dni=validated_data['dni'],
            birthdate=validated_data['birthdate'],
            photo=validated_data.get('photo'),
            phone=validated_data['phone'],
            nationality=validated_data['nationality'],
            province=validated_data['province'],
            is_activate=validated_data.get('is_activate', True)
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'message':'User successfully created',
            'user':new_user.serialize()
        }),201
    except ValueError:
        db.session.rollback()
        return jsonify({'error':'Invalid data type'},400)
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'Database integrity error: ' + str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error: {e}")
        return jsonify({'error':'Error adding user'}),500
    
@admnin_bp.route('/delete/<string:id_user>', methods=['DELETE'])
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def delete_user(id_user):
    user=User.query.get(id_user)
    if not user:
        return jsonify({'message':'User not found'}),404
    try:
        user.is_activate=False #no lo elimnamos de la bd, hacemos un eliminado logico
        #db.session.delete(user)
        db.session.commit()
        return jsonify({'message':'User delete successfuly'}),200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}),500
    
@admnin_bp.route('/edit/<string:id_user>',methods=['PUT'])
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def edit_user(id_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400

    user = User.query.get(id_user)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_dto = UserRegisterDTO(partial=True) #partial permite campos opcionales

    try:
        validated_data = user_dto.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    try:
        if 'first_name' in validated_data:
            user.first_name = validated_data['first_name']

        if 'last_name' in validated_data:
            user.last_name = validated_data['last_name']

        if 'email' in validated_data:
            user.email = validated_data['email'].lower()

        if 'username' in validated_data:
            user.username = validated_data['username']

        if 'rol' in validated_data:
            user.rol = validated_data['rol']

        if 'dni' in validated_data:
            user.dni = validated_data['dni']

        if 'birthdate' in validated_data:
            user.birthdate = validated_data['birthdate']

        if 'photo' in validated_data:
            user.photo = validated_data['photo']

        if 'phone' in validated_data:
            user.phone = validated_data['phone']

        if 'nationality' in validated_data:
            user.nationality = validated_data['nationality']

        if 'province' in validated_data:
            user.province = validated_data['province']

        if 'is_activate' in validated_data:
            user.is_activate = validated_data['is_activate']

        if 'password' in validated_data:
            user.set_password(validated_data['password'])

        db.session.commit()

        return jsonify({'message': 'User edited correctly', 'user': user.serialize()}), 200

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'Database integrity error: ' + str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@admnin_bp.route('/get/tourists')
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def get_tourists():
    tourists= User.query.filter_by(rol=RoleEnum.TOURIST).all()
    if not tourists:
        return jsonify({'message':'There are not tourists registered'}),404
    return jsonify([tourist.serialize() for tourist in tourists])

@admnin_bp.route('/get/tourists/activate')
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def get_tourists():
    tourists= User.query.filter_by(rol=RoleEnum.TOURIST, is_activate=True).all()
    if not tourists:
        return jsonify({'message':'There are not tourists activates'}),404
    return jsonify([tourist.serialize() for tourist in tourists])

@admnin_bp.route('/get/tourists/deactivated')
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def get_tourists():
    tourists= User.query.filter_by(rol=RoleEnum.TOURIST, is_activate=False).all()
    if not tourists:
        return jsonify({'message':'There are not tourists deactivated'}),404
    return jsonify([tourist.serialize() for tourist in tourists])
