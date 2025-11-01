# routes/touristinfo_route.py
from flask import Blueprint, request, jsonify, render_template
from sqlalchemy.exc import IntegrityError
from models.db import db
from models.touristinfo import TouristInfo
from utils.decorators import role_required
from utils.utils import log_action 
touristinfo_bp = Blueprint("touristinfo_bp", __name__, url_prefix="/api/touristinfo")

# ---------------- Crear TouristInfo (solo admin) ----------------
@touristinfo_bp.route("/", methods=["POST"])
@role_required("admin")
def create_tourist(current_user):
    data = request.form.to_dict() or request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    required_fields = ["nationality", "province", "quantity", "person_with_disability", "mobility"]
    missing_fields = [f for f in required_fields if f not in data or str(data[f]).strip() == ""]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    try:
        quantity = int(data["quantity"])
        person_with_disability = int(data["person_with_disability"])

        # 🚨 Validación lógica
        if person_with_disability > quantity:
            return jsonify({"error": "La cantidad de personas con discapacidad no puede ser mayor al total de personas"}), 400

        new_tourist = TouristInfo(
            nationality=data["nationality"].strip(),
            province=data["province"].strip(),
            quantity=quantity,
            person_with_disability=person_with_disability,
            mobility=data["mobility"].strip(),
            id_user=current_user.id_user
        )

        db.session.add(new_tourist)
        db.session.commit()
        log_action(current_user.id_user, f"Created tourist info {new_tourist.id_turist}")
        return jsonify(new_tourist.serialize()), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ---------------- Editar / actualizar TouristInfo (solo admin) ----------------
@touristinfo_bp.route("/<int:tourist_id>", methods=["PATCH"])
@role_required("admin")
def update_tourist(current_user, tourist_id):
    tourist = TouristInfo.query.get(tourist_id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    for field in ["nationality", "province", "quantity", "person_with_disability", "mobility"]:
        if field in data and str(data[field]).strip():
            setattr(tourist, field, data[field])

    try:
        # 🔹 Convertir valores si fueron modificados
        quantity = int(tourist.quantity)
        person_with_disability = int(tourist.person_with_disability)

        # 🔹 Validación lógica
        if person_with_disability > quantity:
            db.session.rollback()
            return jsonify({"error": "La cantidad de personas con discapacidad no puede ser mayor al total de personas"}), 400

        db.session.commit()
        log_action(current_user.id_user, f"Updated tourist info {tourist_id}")
        return jsonify(tourist.serialize()), 200

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ---------------- Reactivar TouristInfo (solo admin) ----------------
@touristinfo_bp.route("/<int:id>/reactivate", methods=["PUT"])
@role_required("admin")
def reactivate_touristinfo(current_user, id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Turista no encontrado"}), 404

    try:
        tourist.is_active = True
        db.session.commit()
        log_action(current_user.id_user, f"Reactivated tourist info {id}")
        return jsonify({"message": "Turista reactivado correctamente."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ---------------- Eliminar TouristInfo (solo admin) ----------------
@touristinfo_bp.route("/<int:tourist_id>", methods=["DELETE"])
@role_required("admin")
def delete_tourist(current_user, tourist_id):
    tourist = TouristInfo.query.get(tourist_id)
    if not tourist:
        return jsonify({"error": "Turista no encontrado"}), 404

    try:
        # 🔹 Borrado lógico
        tourist.is_active = False
        db.session.commit()
        log_action(current_user.id_user, f"Deactivated tourist info {tourist_id}")
        return jsonify({"message": "Turista marcado como inactivo correctamente."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



# ---------------- RUTAS DE ADMIN HTML----------------

# ---------------- Lista admin / CRUD (Carga la vista con JS) ----------------
@touristinfo_bp.route("/list", endpoint="list_tourists_page")
def list_tourists_view():
    tourists = TouristInfo.query.all()
    return render_template("touristinfo/touristinfoadmin/touristinfo.html", tourists=tourists)

# ---------------- RUTAS DE ADMIN HTML----------------

@touristinfo_bp.route("/touristinfo/add", methods=["GET"])
def add_touristinfo_page():
    return render_template("touristinfo/touristinfoadmin/touristinfo_admin_add_touristinfo.html", role="admin")

@touristinfo_bp.route("/touristinfo/edit/<string:id_tourist>", methods=["GET"])
def edit_cit_page(id_cit):
    tourist_info = TouristInfo.query.get(id_cit)
    if not tourist_info:
        return render_template("errors/404.html"), 404
    return render_template("touristinfo/touristinfoadmin/touristinfo_admin_edit_touristinfo.html", tourist_info=tourist_info, role="admin")


@touristinfo_bp.route("/touristinfo/delete/<string:id_tourist>", methods=["GET"])
def delete_touristinfo_page(id_tourist):
    tourist_info = TouristInfo.query.get(id_tourist)
    if not tourist_info:
        return render_template("errors/404.html"), 404
    return render_template("touristinfo/touristinfoadmin/touristinfo_admin_delete_touristinfo.html", tourist_info=tourist_info, role="admin")