from flask import Blueprint, request, jsonify
from models.feedBack import feedBack 
from models.db import db
from datetime import datetime
from schemas.feedBack_schema import feedback_schema
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required
from utils.decorators import role_required
from enums.roles_enums import RoleEnum

feedback_bp = Blueprint("feedback", __name__, url_prefix="/feedback")

# 👉 Cualquier usuario logueado (turista/admin) puede dejar feedback
@feedback_bp.route("/", methods=["POST"])
@jwt_required()
def create_feedback():
    data = request.get_json()
    try:
        validated_data = feedback_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_feedback = feedBack(
        date_hour=datetime.utcnow(),
        comment=validated_data.get("comment"),
        qualification=validated_data["qualification"],
        id_user=validated_data["id_user"],
        id_tourist_site=validated_data["id_tourist_site"]
    )

    db.session.add(new_feedback)
    db.session.commit()

    return jsonify(new_feedback.serialize()), 201


# 👉 Turistas y admins pueden ver todos los feedbacks
@feedback_bp.route("/", methods=["GET"])
@jwt_required()
def get_feedbacks():
    feedbacks = feedBack.query.all()
    return jsonify([f.serialize() for f in feedbacks])


# 👉 Turistas y admins pueden ver un feedback específico
@feedback_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_feedback(id):
    f = feedBack.query.get_or_404(id)
    return jsonify(f.serialize())


# 👉 Solo admin puede editar feedback
@feedback_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def update_feedback(id):
    feedback = feedBack.query.get_or_404(id)
    data = request.get_json()

    try:
        validated_data = feedback_schema.load(data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    feedback.comment = validated_data.get("comment", feedback.comment)
    feedback.qualification = validated_data.get("qualification", feedback.qualification)
    feedback.id_tourist_site = validated_data.get("id_tourist_site", feedback.id_tourist_site)

    db.session.commit()
    return jsonify(feedback.serialize())


# 👉 Solo admin puede eliminar feedback
@feedback_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required(RoleEnum.ADMIN.value)
def delete_feedback(id):
    feedback = feedBack.query.get_or_404(id)
    db.session.delete(feedback)
    db.session.commit()
    return jsonify({"message": "Feedback eliminado con éxito"})
