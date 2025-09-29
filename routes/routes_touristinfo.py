from sqlalchemy.exc import IntegrityError
from flask import Blueprint, render_template, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity 
from models.db import db
from models.touristinfo import TouristInfo
from enums.roles_enums import RoleEnum
from utils.decorators import role_required 

touristinfo_bp = Blueprint('touristinfo_bp', __name__, url_prefix='/api/touristinfo')


# @touristinfo_bp.route("/planilla", methods=["GET"])
# # @jwt_required()
# # @role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
# def touristinfo_planilla():
#     return render_template("touristinfo/touristinfo.html") 

# @touristinfo_bp.route("/statistics", methods=["GET"])
# @jwt_required()
# @role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
# def get_tourist_statistics():
#     total = TouristInfo.query.count()
#     nacionales = TouristInfo.query.filter_by(nationality="Argentina").count()
#     extranjeros = total - nacionales

#     return jsonify({
#         "total_tourists": total,
#         "nacionales": nacionales,
#         "extranjeros": extranjeros,
#         "porcentaje_nacionales": round((nacionales / total) * 100, 2) if total > 0 else 0,
#         "porcentaje_extranjeros": round((extranjeros / total) * 100, 2) if total > 0 else 0
#     }), 200


@touristinfo_bp.route("/planilla", methods=["GET"])
def touristinfo_planilla():
    tourists = TouristInfo.query.all()
    return render_template("touristinfo/touristinfo.html", tourists=tourists)


@touristinfo_bp.route("/", methods=["GET"])
def get_all_tourists():
    tourists = TouristInfo.query.all()
    if not tourists:
        return jsonify({"message": "No tourists found"}), 200
    return jsonify([t.serialize() for t in tourists]), 200 


@touristinfo_bp.route("/<int:id>", methods=["GET"])
def get_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404
    return jsonify(tourist.serialize()), 200


@touristinfo_bp.route("/", methods=["POST"])
def create_tourist():
    data = request.form.to_dict()

    required_fields = ["nationality", "province", "quantity", "person_with_disability", "mobility"]
    missing_or_empty = [f for f in required_fields if f not in data or str(data[f]).strip() == ""]
    if missing_or_empty:
        return jsonify({"error": f"Missing or empty required fields: {', '.join(missing_or_empty)}"}), 400

    try:
        quantity = int(data["quantity"])
        person_with_disability = int(data["person_with_disability"])
    except ValueError:
        return jsonify({"error": "quantity and person_with_disability must be integers"}), 400

    if person_with_disability > quantity:
        return jsonify({"error": "People with disability cannot exceed total quantity"}), 400

    try:
        new_tourist = TouristInfo(
            nationality=data["nationality"].strip(),
            province=data["province"].strip(),
            quantity=quantity,
            person_with_disability=person_with_disability,
            mobility=data["mobility"].strip(),
            id_user="39c6fd66-5883-44fa-8017-86e12e154a2b"
        )
        db.session.add(new_tourist)
        db.session.commit()
        return jsonify(new_tourist.serialize()), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error. The provided id_user may not exist."}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@touristinfo_bp.route("/<int:id>", methods=["PATCH"])
def update_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    data = request.form.to_dict()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    errors = {}
    for field in ["nationality", "province", "quantity", "person_with_disability", "mobility"]:
        if field in data and str(data[field]).strip() == "":
            errors[field] = f"{field} cannot be empty"

    if errors:
        return jsonify({"errors": errors}), 400

    if "quantity" in data:
        try:
            tourist.quantity = int(data["quantity"])
        except ValueError:
            return jsonify({"error": "quantity must be an integer"}), 400
    if "person_with_disability" in data:
        try:
            tourist.person_with_disability = int(data["person_with_disability"])
        except ValueError:
            return jsonify({"error": "person_with_disability must be an integer"}), 400

    tourist.nationality = data.get("nationality", tourist.nationality)
    tourist.province = data.get("province", tourist.province)
    tourist.mobility = data.get("mobility", tourist.mobility)

    if tourist.person_with_disability > tourist.quantity:
        return jsonify({"error": "People with disability cannot exceed total quantity"}), 400

    try:
        db.session.commit()
        return jsonify(tourist.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@touristinfo_bp.route("/<int:id>", methods=["DELETE"])
def delete_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    db.session.delete(tourist)
    db.session.commit()
    return jsonify({"message": "Tourist deleted"}), 200
