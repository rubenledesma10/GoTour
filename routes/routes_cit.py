from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from models.db import db
from models.cit import Cit

cit_bp = Blueprint('cit_bp', __name__, url_prefix='/api/cit')

@cit_bp.route("/api/cits", methods=["GET"])  # Con este metodo traemos todos los Cit existentes o ya creados.
def get_all_cit():
    cits = Cit.query.all()
    if not cits:
        return jsonify(["menssage: There are not Cits registred"]), 200
    return jsonify([c.serialize()] for c in cits), 200

@cit_bp.route("/api/cits/<int:id_cit>", methods=["GET"]) # Con es metodo tremos todos cada Cit creado y lo llamamos por su ID
def get_cit(id_cit):
    cit = cit.quiry.get(id_cit)
    if not cit:
        return jsonify({"Error": "Cit not found"}), 404
    return jsonify (cit.serialize()), 200

@cit_bp.route("/api/cits", methods=["POST"])
def create_cit():
    data = request.get_json

    required_fields = ["district", "address","number_cit","id_user"]
    if not data or any(field not in data for field in required_fields ):
        return jsonify ({"error": "Missing required fields"}), 400
    
    
    try:
        new_cit=Cit(
            district=data["district"],
            address=data["address"],
            number_cit=data["number_cit"],
            id_user=data["id_user"],
            is_activate=data("is_activate", False),
            is_activate_qr_map=data("is_activate_qr_map", False)
            
        )
        db.session.add(new_cit)
        db.session.commit()
        return jsonify(new_cit.serialize()),201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict (possible duplicate key)"}), 400

@cit_bp.route("/api/cits/<int:id_cit>", methods=["PUT"])
def update_cit(id_cit):
    cit = cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify ({"error": "invalid data"}), 400
    
    cit.district = data.get("district", cit.district)
    cit.address = data.get("address", cit.address)
    cit.number_cit = data.get("number_cit", cit.number_cit)
    cit.id_user = data.get("id_user", cit.id_user)
    cit.is_activate = data.get("is_activate", cit.is_activate)
    cit.is_activate_qr_map = data.get("is_activate_qr_map")
    
    db.session.commit()
    return jsonify(cit.serialize()), 200

@cit_bp.route("/api/cits/<int:id_cit>", methods="PATCH")
def patch_cit(id_cit):
    cit= cit.query.get(id_cit)
    if not cit:
        return jsonify ({"error": "Cit not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify ({"error": "Invalid data"}), 400
    
    update_field = ["district", "adrress", "is_activate", "number_cit"]
    
    changes_made = False
    for key, value in data.items():
        if key in update_field:
            setattr(cit, key, value)
            changes_made = True
        else:
            return jsonify({"error": f"Field '{key}' cannot be updated"}), 400
        
    if not changes_made:
        return jsonify({"error": "No valid fields to update"}), 400
    
    db.session.commit()
    return jsonify (cit.serialize()), 200 

@cit_bp.route("api/cits/<int:id_cit>", methods=["DELETE"])
def delete_cit(id_cit):
    cit = cit.query.get(id_cit)
    if not cit:
        return jsonify ({"error": "Cit not found"}), 404
    
    db.session.delete(cit)
    db.session.commit()
    return jsonify ({"message": "Cit deleted successfully"})








