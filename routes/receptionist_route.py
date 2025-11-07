from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request, render_template
from models.db import db
from models.user import User
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from schemas.user_register_schema import user_schema, users_schema
from marshmallow import Schema, fields, ValidationError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from utils.decorators import role_required
from utils.utils import log_action
import random, string
import os, uuid

recepcionist_bp=Blueprint('recepcionist_bp', __name__, url_prefix='/api/recepcionist')

@recepcionist_bp.route("/welcome", methods=["GET"])
@role_required("receptionist")
def test_admin():
    return jsonify({"message":"Endpoint for recepcionist "})


@recepcionist_bp.route("/dashboard", methods=["GET"])
@role_required("receptionist")
def dashboard_tourist_api(current_user):
    return jsonify({
        'username':current_user.username,
        'role':current_user.role
    })

@recepcionist_bp.route("/users_page", methods=["GET"])
def users_page():
    return render_template("user/user_card.html")

@recepcionist_bp.route('/get')
@role_required("receptionist")
def get_tourist_data(current_user):
    if not current_user:
        return jsonify({'message': 'User not found or not logged in'}), 404
    return jsonify(user_schema.dump(current_user)), 200

@recepcionist_bp.route('/delete/<string:id_user>', methods=['DELETE'])
@role_required("receptionist")
def delete_user(current_user, id_user):
    if str(current_user.id_user) != id_user: 
        return jsonify({'message': 'Access Denied. You can only deactivate your own account.'}), 403

    if str(current_user.id_user) == id_user:
        return jsonify({'message': 'You cannot deactivate your own account'}), 403
    user = current_user
    
    try:
        user.is_activate = False
        db.session.commit()
        return jsonify({'message': 'User deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal error occurred'}), 500 
    
@recepcionist_bp.route("/edit_page", methods=["GET"])
def edit_page():
    return render_template("user/user_edit_form.html")

@recepcionist_bp.route("/my_data/edit", methods=['PUT'])
@role_required("receptionist")
def edit_my_data(current_user):
    user = current_user
    data = request.form.to_dict()
    file = request.files.get("photo")

    current_password = data.pop("current_password", None)
    new_password = data.get("password")

    # Validar cambio de contraseña
    if new_password:
        if not current_password:
            return jsonify({"error": "Debe ingresar la contraseña actual para cambiarla."}), 400
        if not user.check_password(current_password):
            return jsonify({"error": "La contraseña actual ingresada es incorrecta."}), 400
    else:
        data.pop("password", None)

    try:
        validated_data = user_schema.load(data, partial=True)
    except ValidationError as err:
        errors = []
        for field, msgs in err.messages.items():
            errors.append(f"{field}: {', '.join(msgs)}")
        return jsonify({"error": " | ".join(errors)}), 400

    try:
        # Foto
        if file and file.filename:
            file_extension = os.path.splitext(file.filename)[1]
            filename = f"{uuid.uuid4()}{file_extension}"
            upload_path = os.path.join("static/uploads", filename)
            file.save(upload_path)
            user.photo = filename

        # Actualizar datos
        for field, value in validated_data.items():
            if field in ["role", "is_activate", "id_user"]:
                continue
            # Recepcionista no puede editar email
            if field == "email":
                continue
            elif field == "password":
                user.set_password(value)
            elif hasattr(user, field):
                setattr(user, field, value)

        db.session.commit()
        log_action(user.id_user, "Editó su perfil")

        return jsonify({
            "message": "Perfil actualizado correctamente ✅",
            "user": user_schema.dump(user)
        }), 200

    except IntegrityError as e:
        db.session.rollback()
        msg = str(e.orig)
        if "email" in msg:
            return jsonify({"error": "Email ya registrado"}), 400
        if "dni" in msg:
            return jsonify({"error": "DNI ya registrado"}), 400
        elif "username" in msg:
            return jsonify({"error": "Nombre de usuario ya usado"}), 400
        elif "phone" in msg:
            return jsonify({"error": "Número de teléfono ya usado"}), 400
        return jsonify({"error": "Ya existe un registro con estos datos"}), 400

    except Exception as e:
        db.session.rollback()
        print(f"Update error: {e}")
        return jsonify({"error": f"Error interno del servidor: {e}"}), 500