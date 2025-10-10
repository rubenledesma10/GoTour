from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request, render_template
from models.db import db
from models.user import User
from datetime import datetime, date, timedelta
from flask import current_app as app
from enums.roles_enums import RoleEnum
from schemas.user_register_schema import user_schema #aca traemos la instancia que declaramos anteriomente
from schemas.user_login_schema import user_login_schema
from marshmallow import Schema, fields, ValidationError
import jwt 
from utils.email_service import send_welcome_email, send_reset_password_email
import random, string
import os, uuid

user_bp = Blueprint('user_bp', __name__, url_prefix='/api/gotour')

@user_bp.route("/login")
def login():
    return render_template("auth/auth.html")

@user_bp.route("/register")
def register():
    return render_template("user/register.html")

@user_bp.route('/register', methods=['POST'])
def register_user():
    #todos los campos de texto vienen en request.form y no en get_json
    data = request.form.to_dict() #convierte los datos enviados  en un diccionario
    file = request.files.get("photo")  #obtenemos la foto si se subio un archivo

    #aca guardamos la foto en el servidir (nuestro proyecto)
    photo_filename = None
    if file:
        filename = f"{uuid.uuid4()}_{file.filename}" #generamos el nombre unico del archivo
        upload_path = os.path.join("static/uploads", filename) #indicamos donde guardamos las imagenes
        file.save(upload_path)
        photo_filename = filename

    try:
        validated_data = user_schema.load(data) #valida que los datos tengan el formato correcto
    except ValidationError as err:
        return jsonify(err.messages), 400

    user = User(
        first_name=validated_data['first_name'],
        last_name=validated_data['last_name'],
        email=validated_data['email'],
        password=validated_data['password'],
        username=validated_data['username'],
        role=validated_data['role'],
        dni=validated_data['dni'],
        birthdate=validated_data['birthdate'],
        photo=photo_filename,
        phone=validated_data['phone'],
        nationality=validated_data['nationality'],
        province=validated_data['province'],
        is_activate=validated_data.get('is_activate', True),
        gender=validated_data['gender']
    )

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        if "email" in str(e.orig):
            return jsonify({"error": "Email ya registrado"}), 400
        elif "dni" in str(e.orig):
            return jsonify({"error": "DNI ya registrado"}), 400
        elif "username" in str(e.orig):
            return jsonify({"error": "Nombre de usuario ya usado"}), 400
        elif "phone" in str(e.orig):
            return jsonify({"error": "Número de telefono ya usado"}), 400
        else:
            return jsonify({"error": "Ya existe un registro con estos datos"}), 400

    send_welcome_email(user.email, user.username)
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
    token = jwt.encode({
        'id_user':user.id_user,
        'exp':datetime.utcnow()+timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
    'token': token,
    'role': user.role,
    'username': user.username
}), 200

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

@user_bp.route('/reactivate-account')
def reactivate_account():
    return render_template("auth/reactivate_account.html")

@user_bp.route('/reactivate-account', methods=['POST'])
def reactivate_account_post():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No user found with that email"}), 404
    
    if user.role != "tourist":
        return jsonify({"error": "Only tourist accounts can be reactivated"}), 403
    
    if user.is_activate:
        return jsonify({"error": "User is already active"}), 400

    
    new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8)) #generamos nueva contraseña

    
    user.is_activate = True #reactivar cuenta
    user.set_password(new_password)
    db.session.commit()

    
    send_welcome_email(user.email, user.username) #enviar email de bienvenida + nueva contraseña
    send_reset_password_email(user.email, new_password)
    
    return jsonify({"message": "Your account has been reactivated. Check your email for the new password."}), 200


