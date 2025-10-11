from flask import Blueprint, request, jsonify, render_template
from sqlalchemy.exc import IntegrityError
from models.db import db
from models.cit import Cit
from utils.decorators import role_required

cit_bp = Blueprint("cit_bp", __name__, url_prefix="/api/cit")

def checkbox_to_bool(value):
    # La lógica en el backend debe manejar strings 'on' (de FormData) y booleanos/strings 'true' (de JSON)
    return str(value).lower() in ["on", "1", "true", "yes", "t"] if value else False

# ---------------- Lista admin / CRUD (Carga la vista con JS) ----------------
@cit_bp.route("/list", endpoint="list_cits_page")
def list_cits_view():
    cits = Cit.query.all()
    # Asumo que 'crud_cit.html' es el nombre de la plantilla que contiene el JS de CRUD
    return render_template("cits/crud_cit.html", cits=cits)

# ---------------- Crear CIT (solo admin) ----------------
@cit_bp.route("/", methods=["POST"])
@role_required("admin")
def create_cit(current_user):
    data = request.form.to_dict() or request.get_json() 
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    required_fields = ["district", "address", "number_cit"]
    missing_fields = [f for f in required_fields if f not in data or str(data[f]).strip() == ""]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    if Cit.query.filter_by(number_cit=data["number_cit"]).first():
        return jsonify({"error": f"number_cit '{data['number_cit']}' already exists"}), 400

    try:
        new_cit = Cit(
            district=data["district"].strip(),
            address=data["address"].strip(),
            number_cit=data["number_cit"],
            id_user=current_user.id_user,
            is_activate=checkbox_to_bool(data.get("is_activate")),
            is_activate_qr_map=checkbox_to_bool(data.get("is_activate_qr_map"))
        )
        db.session.add(new_cit)
        db.session.commit()
        return jsonify(new_cit.serialize()), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ---------------- Editar / actualizar CIT (solo admin) ----------------
@cit_bp.route("/<int:cit_id>", methods=["PATCH"])
@role_required("admin")
def update_cit(cit_id, current_user): 
    cit = Cit.query.get(cit_id)
    if not cit:
        return jsonify({"error": "CIT not found"}), 404

    # Usamos request.get_json() para el PATCH del frontend
    data = request.get_json() 
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    if "district" in data:
        cit.district = data["district"].strip()
    if "address" in data:
        cit.address = data["address"].strip()
    if "number_cit" in data:
        if data["number_cit"] != cit.number_cit and Cit.query.filter_by(number_cit=data["number_cit"]).first():
             return jsonify({"error": f"number_cit '{data['number_cit']}' already exists"}), 400
        cit.number_cit = data["number_cit"]
        
    if "is_activate" in data:
        cit.is_activate = checkbox_to_bool(data.get("is_activate"))
    if "is_activate_qr_map" in data:
        cit.is_activate_qr_map = checkbox_to_bool(data.get("is_activate_qr_map"))
        
    try:
        db.session.commit()
        return jsonify(cit.serialize()), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ---------------- Eliminar CIT (solo admin) ----------------
@cit_bp.route("/<int:cit_id>", methods=["DELETE"]) 
@role_required("admin")
def delete_cit(cit_id, current_user):
    cit = Cit.query.get(cit_id)
    if not cit:
        return jsonify({"error": "CIT not found"}), 404

    try:
        db.session.delete(cit)
        db.session.commit()
        return jsonify({"message": "CIT deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ---------------- API: Obtener todos los CITs (público) ----------------
@cit_bp.route("/", methods=["GET"])
def get_all_cit():
    cits = Cit.query.all()
    if not cits:
        return jsonify({"message": "There are no Cits registered"}), 404
    return jsonify([c.serialize() for c in cits]), 200

# ---------------- API: Obtener un CIT por ID (público) ----------------
@cit_bp.route("/<int:cit_id>", methods=["GET"])
def get_cit(cit_id):
    cit = Cit.query.get(cit_id)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    return jsonify(cit.serialize()), 200