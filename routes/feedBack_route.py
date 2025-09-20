from flask import Blueprint, request, jsonify
from models.feedBack import feedBack
from models.db import db
from datetime import datetime
from schemas.feedBack_schema import feedback_schema
from marshmallow import ValidationError

feedback_bp = Blueprint("feedback", __name__, url_prefix="/feedback")


@feedback_bp.route("/", methods=["POST"])
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
        tour_site=validated_data["tour_site"],
        id_user=validated_data["id_user"],
        id_tourist_site=validated_data["id_tourist_site"]
    )

    db.session.add(new_feedback)
    db.session.commit()

    return feedback_schema.jsonify(new_feedback), 201

@feedback_bp.route("/", methods=["GET"])
def get_feedbacks():
    feedbacks = feedBack.query.all()
    result = []
    for f in feedbacks:
        result.append({
            "id": f.id_feedback,
            "comment": f.comment,
            "qualification": f.qualification,
            "tour_site": f.tour_site,
            "id_user": f.id_user,
            "id_tourist_site": f.id_tourist_site,
            "date_hour": f.date_hour
        })
    return jsonify(result)

@feedback_bp.route("/<int:id>", methods=["GET"])
def get_feedback(id):
    feedback = feedBack.query.get_or_404(id)
    return jsonify({
        "id": feedback.id_feedback,
        "comment": feedback.comment,
        "qualification": feedback.qualification,
        "tour_site": feedback.tour_site,
        "id_user": feedback.id_user,
        "id_tourist_site": feedback.id_tourist_site,
        "date_hour": feedback.date_hour
    })

@feedback_bp.route("/<int:id>", methods=["PUT"])
def update_feedback(id):
    feedback = feedBack.query.get_or_404(id)
    data = request.get_json()

    try:
        validated_data = feedback_schema.load(data, partial=True)  
    except ValidationError as err:
        return jsonify(err.messages), 400

    feedback.comment = validated_data.get("comment", feedback.comment)
    feedback.qualification = validated_data.get("qualification", feedback.qualification)
    feedback.tour_site = validated_data.get("tour_site", feedback.tour_site)

    db.session.commit()
    return feedback_schema.jsonify(feedback)

@feedback_bp.route("/<int:id>", methods=["DELETE"])
def delete_feedback(id):
    feedback = feedBack.query.get_or_404(id)
    db.session.delete(feedback)
    db.session.commit()
    return jsonify({"message": "Feedback eliminado con éxito"})