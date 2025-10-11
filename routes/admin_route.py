from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request, render_template, redirect
from flask import current_app as app
from models.db import db
from models.user import User
from models.audit_log import AuditLog
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from schemas.user_register_schema import user_schema, users_schema
from marshmallow import Schema, fields, ValidationError
from utils.email_service import send_welcome_email, send_welcome_email_admin
from utils.decorators import role_required
from utils.utils import log_action
import os, uuid

#ACA VAN A ESTAR TODAS LAS RUTAS EN LAS QUE EL ADMINISTRADOR PUEDE ACCEDER
admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')

@admin_bp.route("/welcome", methods=["GET"])
@role_required("admin")
def test_admin(current_user):
    return jsonify({"message": f"Endpoint for admin {current_user.username}"})

@admin_bp.route("/dashboard", methods=["GET"])
@role_required("admin")
def dashboard_admin_api(current_user):
    return jsonify({
        'username':current_user.username,
        'role':current_user.role
    })

@admin_bp.route("/users_page", methods=["GET"])
def users_page():
    return render_template("user/user.html")

@admin_bp.route('/get')
@role_required("admin")
def get_users_all(current_user):
    users = User.query.all()
    if not users:
        return jsonify({'message':'There are not users registered'}), 404
    return jsonify(users_schema.dump(users))

# @admin_bp.route('/get/<string:id_user>', methods=['GET'])
# @role_required("admin")
# def get_user_id(current_user, id_user):
#     user = User.query.get(id_user)
#     if not user:
#         return jsonify({'message':'User not found'}), 404
#     return jsonify(user_schema.dump(user)), 200

# @admin_bp.route('/get/dni/<string:dni>', methods=['GET'])
# @role_required("admin")
# def get_user_dni(current_user, dni):
#     user = User.query.filter_by(dni=dni).first()
#     if not user:
#         return jsonify({'message':'User not found'}), 404
#     return jsonify(user_schema.dump(user)), 200

@admin_bp.route('/add', methods=['POST'])
@role_required("admin")
def add_user(current_user):
    #todos los campos de texto vienen en request.form y no en get_json
    data = request.form.to_dict() #convierte los datos enviados  en un diccionario
    file = request.files.get("photo")  #obtenemos la foto si se subio un archivo
    
        # Limpiamos el DNI: quitamos puntos, guiones y espacios
    dni = data.get('dni', '').replace('.', '').replace('-', '').replace(' ', '')

    # Validamos que solo contenga números
    if not dni.isdigit():
        return jsonify({"error": "DNI inválido, solo números"}), 400

    # Reemplazamos el valor limpio en data
    data['dni'] = dni
    #aca guardamos la foto en el servidir (nuestro proyecto)
    photo_filename = None
    if file:
        filename = f"{uuid.uuid4()}_{file.filename}" #generamos el nombre unico del archivo
        upload_path = os.path.join("static/uploads", filename) #indicamos donde guardamos las imagenes
        file.save(upload_path)
        photo_filename = filename
    try:
        validated_data = user_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    try:
        new_user = User(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'].lower(),
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
        db.session.add(new_user)
        db.session.commit()
        send_welcome_email_admin(new_user.email, new_user.username)
        log_action(current_user.id_user, f"Created user {new_user.id_user}")
        return jsonify({
            'message':'User successfully created',
            'user': user_schema.dump(new_user)
        }), 201
        
    except ValueError:
        db.session.rollback()
        return jsonify({'error':'Invalid data type'}), 400
    except IntegrityError as e:
        db.session.rollback()
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
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error: {e}")
        return jsonify({'error':'Error adding user'}), 500

    

@admin_bp.route('/newUser')
def new_user_page():
    return render_template("user/register_admin.html")   
 
@admin_bp.route('/edit/<string:id_user>')
def edit_user_page(id_user):
    user = User.query.get(id_user)
    if not user:
        return "Usuario no encontrado", 404

    user_data = user_schema.dump(user)  #para que me incluya age 

    return render_template("user/edit_admin.html", user=user_data)
    

@admin_bp.route('/edit/<string:id_user>', methods=['PUT'])
@role_required("admin")
def edit_user(current_user, id_user):
    user = User.query.get(id_user)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.form.to_dict()
    file = request.files.get("photo")

    try:
        validated_data = user_schema.load(data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    try:
        # Guardar foto si se subió
        if file:
            filename = f"{uuid.uuid4()}_{file.filename}"
            upload_path = os.path.join("static/uploads", filename)
            file.save(upload_path)
            user.photo = filename

        # Actualizar campos
        for field, value in validated_data.items():
            if field == "email":
                value = value.lower()
            if field == "password":
                user.set_password(value)
            else:
                setattr(user, field, value)

        log_action(current_user.id_user, f"Edited user {id_user}")

        db.session.commit()
        return jsonify({
            'message': 'User edited correctly',
            'user': user_schema.dump(user)
        }), 200

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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    
    
@admin_bp.route('/delete/<string:id_user>', methods=['DELETE'])
@role_required("admin")
def delete_user(current_user, id_user):

    if str(current_user.id_user) == id_user:
        return jsonify({'message': 'You cannot deactivate your own account'}), 403
    
    user = User.query.get(id_user)
    if not user:
        return jsonify({'message':'User not found'}), 404
    
    if not user.is_activate:
        return jsonify({'message':'The user is already deactivate. '})

    try:
        user.is_activate = False  #eliminado lógico
        db.session.commit()
        log_action(current_user.id_user, f"Deactivated user {id_user}")
        return jsonify({'message':'User deactivated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@admin_bp.route('/activate/<string:id_user>', methods=['PATCH'])
@role_required("admin")
def activate_user(current_user, id_user):
    user = User.query.get(id_user)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user.is_activate:
        return jsonify({'message':'The user is already active. '})

    try:
        user.is_activate = True  #reactivar usuario
        db.session.commit()
        log_action(current_user.id_user, f"Activated user {id_user}")
        return jsonify({'message': 'User activated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@admin_bp.route('/audit-logs', methods=['GET'])
def get_audit_logs():
    logs = db.session.query(AuditLog, User.username)\
    .join(User, AuditLog.user_id == User.id_user)\
    .order_by(AuditLog.timestamp.desc()).all()
    return jsonify([
        {"id": log.AuditLog.id,
        "user": log.username,
        "action": log.AuditLog.action,
        "timestamp": log.AuditLog.timestamp}
        for log in logs
    ])


# @admin_bp.route('/get/tourists')
# @role_required("admin")
# def get_tourists(current_user):
#     tourists = User.query.filter_by(rol=RoleEnum.TOURIST).all()
#     if not tourists:
#         return jsonify({'message':'There are no tourists registered'}), 404
#     return jsonify(users_schema.dump(tourists)), 200

# @admin_bp.route('/get/tourists/activate')
# @role_required("admin")
# def get_tourists_activate(current_user):
#     tourists = User.query.filter_by(rol=RoleEnum.TOURIST, is_activate=True).all()
#     if not tourists:
#         return jsonify({'message':'There are no active tourists'}), 404
#     return jsonify(users_schema.dump(tourists)), 200

# @admin_bp.route('/get/tourists/deactivated')
# @role_required("admin")
# def get_tourists_deactivated():
#     tourists= User.query.filter_by(rol=RoleEnum.TOURIST, is_activate=False).all()
#     if not tourists:
#         return jsonify({'message':'There are not tourists deactivated'}),404
#     return jsonify (users_schema.dump(tourists)),200
@admin_bp.route("/audit-logs-page")
def audit_logs_page():
    return render_template("user/audit_logs.html")