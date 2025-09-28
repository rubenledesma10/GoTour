from sqlalchemy.exc import IntegrityError
from flask import Blueprint, render_template, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity 
from models.db import db
from models.touristinfo import TouristInfo
from enums.roles_enums import RoleEnum
from utils.decorators import role_required 

touristinfo_bp = Blueprint('touristinfo_bp', __name__, url_prefix='/api/touristinfo')

# --- Ruta corregida: endpoint explícito ---

@touristinfo_bp.route("/planilla", methods=["GET"])
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def touristinfo_planilla():
    return render_template("touristinfo/touristinfo.html")


@touristinfo_bp.route("/", methods=["GET"])
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def get_all_tourists():
    tourists = TouristInfo.query.all()
    if not tourists:
        return jsonify({"message": "No tourists found"}), 200
    
    return jsonify([t.serialize() for t in tourists]), 200

@touristinfo_bp.route("/statistics", methods=["GET"])
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def get_tourist_statistics():
    total = TouristInfo.query.count()
    nacionales = TouristInfo.query.filter_by(nationality="Argentina").count()
    extranjeros = total - nacionales

    return jsonify({
        "total_tourists": total,
        "nacionales": nacionales,
        "extranjeros": extranjeros,
        "porcentaje_nacionales": round((nacionales / total) * 100, 2) if total > 0 else 0,
        "porcentaje_extranjeros": round((extranjeros / total) * 100, 2) if total > 0 else 0
    }), 200

@touristinfo_bp.route("/<int:id>", methods=["GET"])
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def get_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404
    return jsonify(tourist.serialize()), 200

@touristinfo_bp.route("/", methods=["POST"])
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def create_tourist():
    data = request.get_json()
    required_fields = ["nationality", "province", "quantity", "person_with_disability", "mobility"]
    if not data or any(field not in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    if data["person_with_disability"] > data["quantity"]:
        return jsonify({"error": "People with disability cannot exceed total quantity"}), 400

    try:
        current_user_id = get_jwt_identity()
        new_tourist = TouristInfo(
            nationality=data["nationality"],
            province=data["province"],
            quantity=data["quantity"],
            person_with_disability=data["person_with_disability"],
            mobility=data["mobility"],
            id_user=current_user_id
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

@touristinfo_bp.route("/<int:id>", methods=["PUT"])
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def update_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    tourist.nationality = data.get("nationality", tourist.nationality)
    tourist.province = data.get("province", tourist.province)
    tourist.quantity = data.get("quantity", tourist.quantity)
    tourist.person_with_disability = data.get("person_with_disability", tourist.person_with_disability)
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
@role_required([RoleEnum.RECEPCIONIST.value, RoleEnum.ADMIN.value])
def delete_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    db.session.delete(tourist)
    db.session.commit()
    return jsonify({"message": "Tourist deleted"}), 200
