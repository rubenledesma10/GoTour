from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from models.db import db
from models.cit import Cit 
from flask_jwt_extended import jwt_required, get_jwt_identity
from enums.roles_enums import RoleEnum
from utils.decorators import role_required
# En un archivo llamado, por ejemplo, views.py
from flask import Blueprint, render_template


cit_bp = Blueprint('cit_bp', __name__, url_prefix='/api/cits')

@cit_bp.route("/list", endpoint="list_cits_page")
def list_cit_page():
    cits = Cit.query.all()
    return render_template("cits/list_cit.html", cits=cits)


@cit_bp.route("/", methods=["GET"])
def get_all_cit():
    cits = Cit.query.all()
    if not cits:
        return jsonify({"message": "There are no Cits registered"}), 200
    return jsonify([c.serialize() for c in cits]), 200

@cit_bp.route("/<int:id_cit>", methods=["GET"])
def get_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    return jsonify(cit.serialize()), 200

@cit_bp.route("/", methods=["POST"])
@jwt_required()
@role_required([RoleEnum.ADMIN.value])
def create_cit():
    data = request.get_json()

    required_fields = ["district", "address", "number_cit", "id_user"]
    if not data or any(field not in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_cit = Cit(
            district=data["district"],
            address=data["address"],
            number_cit=data["number_cit"],
            id_user=data["id_user"],
            is_activate=data.get("is_activate", False),
            is_activate_qr_map=data.get("is_activate_qr_map", False)
        )
        db.session.add(new_cit)
        db.session.commit()
        return jsonify(new_cit.serialize()), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Data conflict (e.g., duplicate unique key)"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@cit_bp.route("/<int:id_cit>", methods=["PUT"])
@jwt_required()
@role_required([RoleEnum.ADMIN.value])
def update_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400
    
    cit.district = data.get("district", cit.district)
    cit.address = data.get("address", cit.address)
    cit.number_cit = data.get("number_cit", cit.number_cit)
    cit.id_user = data.get("id_user", cit.id_user)
    cit.is_activate = data.get("is_activate", cit.is_activate)
    cit.is_activate_qr_map = data.get("is_activate_qr_map", cit.is_activate_qr_map)
    
    try:
        db.session.commit()
        return jsonify(cit.serialize()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Data conflict (e.g., duplicate unique key)"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@cit_bp.route("/<int:id_cit>", methods=["PATCH"])
@jwt_required()
@role_required([RoleEnum.ADMIN.value])
def patch_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400
    
    allowed_fields = ["district", "address", "is_activate", "number_cit", "is_activate_qr_map"]
    changes_made = False
    
    for key, value in data.items():
        if key in allowed_fields:
            setattr(cit, key, value)
            changes_made = True
        else:
            return jsonify({"error": f"Field '{key}' cannot be updated"}), 400
            
    if not changes_made:
        return jsonify({"error": "No valid fields to update"}), 400
    
    try:
        db.session.commit()
        return jsonify(cit.serialize()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Data conflict (e.g., duplicate unique key)"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@cit_bp.route("/<int:id_cit>", methods=["DELETE"])
@jwt_required()
@role_required([RoleEnum.ADMIN.value])
def delete_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    
    db.session.delete(cit)
    db.session.commit()
    return jsonify({"message": "Cit deleted successfully"}), 200