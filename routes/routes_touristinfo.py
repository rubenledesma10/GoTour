from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from models.db import db
from enums.roles_enums import RoleEnum
from models.touristinfo import TouristInfo
from flask_jwt_extended import create_access_token, jwt_required
from utils.decorators import role_required
touristinfo_bp = Blueprint('touristinfo_bp', __name__, url_prefix='/api/touristinfo')



@touristinfo_bp.route("/", methods=["GET"])
@jwt_required()
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def get_all_tourists():
    tourists = TouristInfo.query.all()
    return jsonify([t.serialize() for t in tourists]), 200


@touristinfo_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def get_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404
    return jsonify(tourist.serialize()), 200

@touristinfo_bp.route("/", methods=["POST"])
@jwt_required()
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def create_tourist():
    data = request.get_json()

    required_fields = ["nationality", "province", "quantity", "person_with_disability", "mobility"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    if data["person_with_disability"] > data["quantity"]:
        return jsonify({"error": "People with disability cannot exceed total quantity"}), 400

    new_tourist = TouristInfo(
        nationality=data["nationality"],
        province=data["province"],
        quantity=data["quantity"],
        person_with_disability=data["person_with_disability"],
        mobility=data["mobility"]
    )

    db.session.add(new_tourist)
    db.session.commit()

    return jsonify(new_tourist.serialize()), 201

@touristinfo_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def update_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    data = request.get_json()

    tourist.nationality = data.get("nationality", tourist.nationality)
    tourist.province = data.get("province", tourist.province)
    tourist.quantity = data.get("quantity", tourist.quantity)
    tourist.person_with_disability = data.get("person_with_disability", tourist.person_with_disability)
    tourist.mobility = data.get("mobility", tourist.mobility)

    if tourist.person_with_disability > tourist.quantity:
        return jsonify({"error": "People with disability cannot exceed total quantity"}), 400

    db.session.commit()
    return jsonify(tourist.serialize()), 200

@touristinfo_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def delete_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    db.session.delete(tourist)
    db.session.commit()
    return jsonify({"message": "Tourist deleted"}), 200



