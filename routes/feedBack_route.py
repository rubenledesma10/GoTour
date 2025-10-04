from flask import Blueprint, jsonify, request, render_template, current_app as app
from sqlalchemy.exc import IntegrityError
from models.db import db
from models.feedBack import feedBack
from models.user import User
from models.tourist_site import TouristSite
from schemas.feedBack_schema import feedback_schema
from enums.roles_enums import RoleEnum
from marshmallow import ValidationError
from datetime import datetime
import jwt

feedback_bp = Blueprint("feedback_bp", __name__, url_prefix="/api/feedback")


# 🧩 Helper interno: decodificar token al estilo user.py
def get_identity_from_header():
    """Decodifica el token JWT del header Authorization y devuelve el id_user."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None, {"error": "Token no proporcionado"}, 401

    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded["id_user"], None, None
    except jwt.ExpiredSignatureError:
        return None, {"error": "El token ha expirado"}, 401
    except jwt.InvalidTokenError:
        return None, {"error": "Token inválido"}, 401


# 👉 Vista del formulario de feedback
@feedback_bp.route("/view")
def feedback_view():
    """Renderiza el formulario de feedback (opcionalmente con usuario logueado)."""
    usuario = None
    auth_header = request.headers.get("Authorization")

    if auth_header:
        identity, err, code = get_identity_from_header()
        if not err:
            usuario = User.query.filter_by(id_user=identity).first()

    sites = TouristSite.query.all()
    return render_template("feedBack/usuario.html", usuario=usuario, sites=sites)


# 👉 Crear nuevo feedback (usuario autenticado, no admin)
@feedback_bp.route("/", methods=["POST"])
def create_feedback():
    """Permite al usuario autenticado dejar un feedback."""
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code

    user = User.query.filter_by(id_user=identity).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if user.role == RoleEnum.ADMIN.value:
        return jsonify({"error": "Los administradores no pueden dejar comentarios"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    try:
        validated_data = feedback_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    comment = validated_data.get("comment", "").strip()
    qualification = validated_data.get("qualification")
    id_tourist_site = validated_data.get("id_tourist_site")

    if not comment:
        return jsonify({"error": "El comentario no puede estar vacío"}), 400
    if not (1 <= qualification <= 5):
        return jsonify({"error": "La calificación debe estar entre 1 y 5"}), 400

    site = TouristSite.query.get(id_tourist_site)
    if not site:
        return jsonify({"error": f"El sitio turístico con id {id_tourist_site} no existe"}), 404

    new_feedback = feedBack(
        date_hour=datetime.utcnow(),
        comment=comment,
        qualification=qualification,
        id_user=user.id_user,
        id_tourist_site=id_tourist_site
    )

    try:
        db.session.add(new_feedback)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Error al registrar feedback", "detail": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"feedback": new_feedback.serialize()}), 201


# 👉 Obtener todos los feedbacks (público)
@feedback_bp.route("/", methods=["GET"])
def get_feedbacks():
    """Devuelve todos los feedbacks ordenados por fecha descendente."""
    try:
        feedbacks = feedBack.query.order_by(feedBack.date_hour.desc()).all()
        return jsonify([f.serialize() for f in feedbacks]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 👉 Actualizar feedback (solo admin)
@feedback_bp.route("/<int:id>", methods=["PUT"])
def update_feedback(id):
    """Permite al administrador editar un feedback existente."""
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code

    user = User.query.filter_by(id_user=identity).first()
    if not user or user.role != RoleEnum.ADMIN.value:
        return jsonify({"error": "Debes iniciar sesión como administrador"}), 401

    feedback = feedBack.query.get(id)
    if not feedback:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    try:
        validated_data = feedback_schema.load(data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422

    if "comment" in validated_data:
        comment = validated_data["comment"].strip()
        if not comment:
            return jsonify({"error": "El comentario no puede estar vacío"}), 400
        feedback.comment = comment

    if "qualification" in validated_data:
        q = validated_data["qualification"]
        if q is None or not (1 <= q <= 5):
            return jsonify({"error": "La calificación debe estar entre 1 y 5"}), 400
        feedback.qualification = q

    try:
        db.session.commit()
        return jsonify({"feedback": feedback.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# 👉 Eliminar feedback (solo admin)
@feedback_bp.route("/<int:id>", methods=["DELETE"])
def delete_feedback(id):
    """Permite al administrador eliminar un feedback."""
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code

    user = User.query.filter_by(id_user=identity).first()
    if not user or user.role != RoleEnum.ADMIN.value:
        return jsonify({"error": "Debes iniciar sesión como administrador"}), 401

    feedback = feedBack.query.get(id)
    if not feedback:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404

    try:
        db.session.delete(feedback)
        db.session.commit()
        return jsonify({"message": "Feedback eliminado con éxito"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
