from flask import Blueprint, request, jsonify, render_template
from sqlalchemy.exc import IntegrityError
from models.db import db
from models.cit import Cit
from utils.decorators import role_required
from models.user import User

cit_bp = Blueprint("cit_bp", __name__)

# ---------------- Crear CIT (solo admin) ----------------
@cit_bp.route("/api/add_cit", methods=["POST"])
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
        if not current_user or not current_user.id_user:
            return jsonify({'error': 'User not found in token'}), 400

        # Conversión a booleano simple y clara
        is_activate = str(data.get('is_activate', 'false')).lower() in ('true', '1', 'on')
        is_activate_qr_map = str(data.get('is_activate_qr_map', 'false')).lower() in ('true', '1', 'on')

        new_cit = Cit(
            district=data["district"].strip(),
            address=data["address"].strip(),
            number_cit=data["number_cit"],
            id_user=current_user.id_user,
            is_activate=is_activate,
            is_activate_qr_map=is_activate_qr_map
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

# ---------------- Editar CIT (solo admin) ----------------
@cit_bp.route("/api/<string:cit_id>", methods=["PATCH"])
@role_required("admin")
def update_cit(current_user, cit_id):
    cit = Cit.query.get(cit_id)
    if not cit:
        return jsonify({"error": "CIT not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    # --- Normalizamos los valores ---
    number_cit = str(data.get("number_cit", cit.number_cit)).strip()
    district = str(data.get("district", cit.district)).strip()
    address = str(data.get("address", cit.address)).strip()

    # --- Validación: el número de CIT no puede repetirse en otro registro ---
    existing_cit = Cit.query.filter(Cit.number_cit == number_cit, Cit.id_cit != cit_id).first()
    if existing_cit:
        return jsonify({"error": f"El número de CIT '{number_cit}' ya está asignado a otro registro."}), 400

    # --- Actualización de datos ---
    cit.number_cit = number_cit
    cit.district = district
    cit.address = address

    if "is_activate" in data:
        cit.is_activate = str(data.get("is_activate", "false")).lower() in ("true", "1", "on")
    if "is_activate_qr_map" in data:
        cit.is_activate_qr_map = str(data.get("is_activate_qr_map", "false")).lower() in ("true", "1", "on")

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

@cit_bp.route("/api/cit/<string:id_cit>", methods=["DELETE"])
@role_required("admin")
def delete_cit(current_user, id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "CIT not found"}), 404

    try:
        cit.is_activate = False
        db.session.commit()
        return jsonify({"message": "CIT deactivated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ---------------- Obtener todos los CITs (público) ----------------
@cit_bp.route("/api/cit", methods=["GET"])
def get_all_cit():
    cits = Cit.query.all()
    if not cits:
        return jsonify({"message": "There are no Cits registered"}), 404
    return jsonify([c.serialize() for c in cits]), 200


# ---------------- Obtener un CIT por ID (público) ----------------
@cit_bp.route("/api/cit/<string:cit_id>", methods=["GET"])
def get_cit(cit_id):
    cit = Cit.query.get(cit_id)
    if not cit:
        return jsonify({"error": "CIT not found"}), 404
    return jsonify(cit.serialize()), 200

# --------------- Reactivacion de CIT (solo admin) ----------------
@cit_bp.route("/api/cit/<string:id_cit>/reactivate", methods=["PUT"])
@role_required("admin")
def reactivate_cit(current_user, id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "CIT not found"}), 404

    try:
        cit.is_activate = True
        db.session.commit()
        return jsonify({"message": "CIT reactivated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



# ---------------- Rutas HTML ----------------
@cit_bp.route("/cit/view", methods=["GET"])
def cits_view():
    cits = Cit.query.all()
    return render_template("cits/cit.html", cits=cits, role="admin")

@cit_bp.route("/cit/add", methods=["GET"])
def add_cit_page():
    return render_template("cits/add_cit.html", role="admin")

@cit_bp.route("/cit/edit/<string:id_cit>", methods=["GET"])
def edit_cit_page(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return render_template("errors/404.html"), 404
    return render_template("cits/edit_cit.html", cit=cit, role="admin")


@cit_bp.route("/cit/delete/<string:id_cit>", methods=["GET"])
def delete_cit_page(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return render_template("errors/404.html"), 404
    return render_template("cits/delete_cit.html", cit=cit, role="admin")
