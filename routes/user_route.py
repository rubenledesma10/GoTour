from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request, render_template
from models.db import db
from models.user import User
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from schemas.user_register_schema import user_schema #aca traemos la instancia que declaramos anteriomente
from schemas.user_login_schema import user_login_schema
from marshmallow import Schema, fields, ValidationError
from flask_jwt_extended import create_access_token
from utils.email_service import send_welcome_email, send_reset_password_email
import random, string


user_bp = Blueprint('user_bp', __name__, url_prefix='/api/gotour')

@user_bp.route("/login")
def login():
    return render_template("auth/auth.html")

@user_bp.route("/register")
def register():
    return render_template("user/register.html")

@user_bp.route('/register', methods=['POST'])
def register_user():
    data=request.get_json() #obtenemos el body del json
    try:
        validated_data=user_schema.load(data) 
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
    
    send_welcome_email(user.email, user.username)

    # access_token = create_access_token(
    #     identity=str(user.id_user),
    #     additional_claims={"role": user.rol.value}
    # )

    #aca serializamos el objeto con Marshmallow para la repuesta
    return jsonify({"user": user_schema.dump(user)}), 201

@user_bp.route('/login', methods=['POST'])
def login_user():
    data=request.get_json()
    try:
        validated_data=user_login_schema.load(data)
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

@user_bp.route('/forgot-password')
def forgot_password():
    return render_template("auth/forgot_password.html")

@user_bp.route('/forgot-password', methods=['POST'])
def forgot_password_new_password():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No user found with that email"}), 404

    new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8)) #generar contraseña aleatoria

    
    user.set_password(new_password) #actualizar contraseña en DB (hasheada con tu método de User)
    db.session.commit()

    
    send_reset_password_email(user.email, new_password) #enviar correo con la nueva contraseña

    return jsonify({"message": "An email with the new password has been sent"}), 200
