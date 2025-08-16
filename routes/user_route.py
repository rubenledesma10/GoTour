from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models.db import db
from models.user import User
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from dtos.user_register_dto import UserRegisterDTO
from dtos.user_login_dto import UserLoginDTO
from marshmallow import Schema, fields, ValidationError
from flask_jwt_extended import create_access_token

user_bp = Blueprint('user_bp', __name__, url_prefix='/api/user')

@user_bp.route('/register', methods=['POST'])
def register():
    data=request.get_json() #obtenemos el body del json
    user_register_dto= UserRegisterDTO()
    try:
        validated_data=user_register_dto.load(data) #valida y convierte tipos. si falla, devuelve 400 con los errores.
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

@user_bp.route('/login', methods=['POST'])
def login_user():
    data=request.get_json()
    user_login_dto=UserLoginDTO()
    try:
        validated_data=user_login_dto.load(data)
    except ValidationError as err:
        return jsonify(err.messages),400 #si falta un atributo o no cumple con algunas de las validaciones devuelve un 400
    
    user = User.query.filter_by(email=validated_data['email'].lower()).first() #buscamos al usuario
    
    if not user or not user.check_password(validated_data['password']): #para comparar la contraseña hasheada
        return jsonify({'error':'Invalid email or password'}), 401
    
    if not user.is_activate: #si el usuario esta desactivado
        return jsonify({'error':'User account is deactivated'}),403
    
    #aca creamos el token
    access_token = create_access_token(
        identity=str(user.id_user),
        additional_claims={"role": user.rol.value}
    ) #se genera un jwt firmado con la clave secreta. Identity lo usamos para guardar algo que identifique al usuario (id_user)

    return jsonify({'access_token':access_token}),200
