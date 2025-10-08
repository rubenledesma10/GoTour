from flask import Blueprint, request, jsonify, render_template
from models.feedBack import feedBack
from models.db import db
from datetime import datetime
from schemas.feedBack_schema import feedback_schema
from marshmallow import ValidationError
from utils.decorators import role_required
from enums.roles_enums import RoleEnum
from flask_login import current_user
from models.tourist_site import TouristSite
from flask import current_app

feedback_bp = Blueprint("feedback_bp", __name__, url_prefix="/api/feedback")

@feedback_bp.route("/")
def get_feedback_view():
    return render_template("feedBack/usuario.html")

# 👉 Crear feedback (usuario logueado, NO admin)
@feedback_bp.route("/", methods=["POST"])
def create_feedback():
    if not current_user.is_authenticated:
        return jsonify({"error": "Debes iniciar sesión para dejar un comentario"}), 401

    if current_user.role == RoleEnum.ADMIN.value:
        return jsonify({"error": "Los administradores no pueden dejar comentarios"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    try:
        validated_data = feedback_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    # Validaciones
    comment = validated_data.get("comment", "").strip()
    qualification = validated_data.get("qualification")
    id_tourist_site = validated_data.get("id_tourist_site")

    if not comment:
        return jsonify({"error": "El comentario no puede estar vacío"}), 400

    if not (1 <= qualification <= 5):
        return jsonify({"error": "La calificación debe estar entre 1 y 5"}), 400

    if not TouristSite.query.get(id_tourist_site):
        return jsonify({"error": f"El sitio turístico con id {id_tourist_site} no existe"}), 404

    new_feedback = feedBack(
        date_hour=datetime.utcnow(),
        comment=comment,
        qualification=qualification,
        id_user=current_user.id_user,
        id_tourist_site=id_tourist_site
    )

    try:
        db.session.add(new_feedback)
        db.session.commit()
        return jsonify(new_feedback.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# 👉 Obtener todos los feedbacks (público)
@feedback_bp.route("/", methods=["GET"])
def get_feedbacks():
    try:
        feedbacks = feedBack.query.order_by(feedBack.date_hour.desc()).all()
        return jsonify([f.serialize() for f in feedbacks]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 👉 Obtener feedback específico
@feedback_bp.route("/<int:id>", methods=["GET"])
def get_feedback(id):
    f = feedBack.query.get(id)
    if not f:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404
    return jsonify(f.serialize()), 200


# 👉 Actualizar feedback (solo admin)


@feedback_bp.route("/<int:id>", methods=["PUT"])
def update_feedback(id):
    if not current_user.is_authenticated:
        return jsonify({"error": "Debes iniciar sesión como administrador"}), 401

    feedback = feedBack.query.get(id)
    if not feedback:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    # 👇 LOG siempre
    current_app.logger.warning(f"DATA RECIBIDA: {data}")

    try:
        validated_data = feedback_schema.load(data, partial=True)
        current_app.logger.warning(f"DATA VALIDADA: {validated_data}")
    except ValidationError as err:
        current_app.logger.error(f"ERRORES DE VALIDACIÓN: {err.messages}")
        return jsonify(err.messages), 422

    if not current_user.is_authenticated:
        return jsonify({"error": "Debes iniciar sesión como administrador"}), 401

    feedback = feedBack.query.get(id)
    if not feedback:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    
        # ⚡ Validamos parcialmente: solo los campos que vienen en el body
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
        return jsonify(feedback.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# 👉 Eliminar feedback (solo admin)
@feedback_bp.route("/<int:id>", methods=["DELETE"])
def delete_feedback(id):
    if not current_user.is_authenticated:
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
