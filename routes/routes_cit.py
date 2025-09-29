from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from models.db import db
from models.cit import Cit 
from flask_jwt_extended import jwt_required, get_jwt_identity
from enums.roles_enums import RoleEnum
from utils.decorators import role_required
from flask import Blueprint, render_template

cit_bp = Blueprint("cit_bp", __name__, url_prefix="/api/cit")

@cit_bp.route("/list", endpoint="list_cits_page")
def list_cit_page():
    cits = Cit.query.all()
    return render_template("cits/list_cit.html", cits=cits)


@cit_bp.route("/", methods=["GET"])#Con este traemos todos los cit registrados 
def get_all_cit():
    cits = Cit.query.all()
    if not cits:
        return jsonify({"message": "There are no Cits registered"}), 404
    return jsonify([c.serialize() for c in cits]), 200

@cit_bp.route("/<int:id_cit>", methods=["GET"])#Con este traemos solo el cit deseado con el ID_CIT
def get_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    return jsonify(cit.serialize()), 200


@cit_bp.route("/", methods=["POST"])
# @role_required("admin")
def create_cit():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid data"}), 400

    # Campos obligatorios
    required_fields = ["district", "address", "number_cit", "id_user"]
    missing_fields = [field for field in required_fields 
                    if field not in data or str(data[field]).strip() == ""]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    # Validar duplicado de number_cit
    existing_number = Cit.query.filter_by(number_cit=data["number_cit"]).first()
    if existing_number:
        return jsonify({"error": f"number_cit '{data['number_cit']}' already exists"}), 400

    try:
        new_cit = Cit(
            district=data["district"].strip(),
            address=data["address"].strip(),
            number_cit=data["number_cit"],
            id_user=data["id_user"],
            is_activate=bool(data.get("is_activate", False)),
            is_activate_qr_map=bool(data.get("is_activate_qr_map", False))
        )

        db.session.add(new_cit)
        db.session.commit()
        return jsonify(new_cit.serialize()), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict (e.g., duplicate unique key)", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@cit_bp.route("/<int:id_cit>", methods=["PATCH"])
# @role_required("admin")
def patch_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    # Campos permitidos
    allowed_fields = ["number_cit", "district", "address", "is_activate", "is_activate_qr_map"]

    # Verificar campos vacíos solo si vienen en el request
    for field in data:
        if field in allowed_fields:
            if data[field] in [None, ""]:
                return jsonify({"error": f"Field '{field}' cannot be empty"}), 400
            setattr(cit, field, data[field])
        else:
            return jsonify({"error": f"Field '{field}' cannot be updated"}), 400

    try:
        db.session.commit()
        return jsonify(cit.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@cit_bp.route("/<int:id_cit>", methods=["PUT"])
# @role_required("admin")
def update_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    # Campos obligatorios
    required_fields = ["number_cit", "district", "address"]
    missing_fields = [field for field in required_fields if field not in data or data[field] in [None, ""]]
    if missing_fields:
        return jsonify({"error": f"Missing or empty required fields: {', '.join(missing_fields)}"}), 400

    # Campos permitidos para actualizar
    allowed_fields = ["number_cit", "district", "address", "is_activate", "is_activate_qr_map"]
    for field in allowed_fields:
        if field in data:
            setattr(cit, field, data[field])

    try:
        db.session.commit()
        return jsonify(cit.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@cit_bp.route("/<int:id_cit>", methods=["DELETE"])
# @role_required("admin")
def delete_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    
    db.session.delete(cit)
    db.session.commit()
    return jsonify({"message": "Cit deleted successfully"}), 200