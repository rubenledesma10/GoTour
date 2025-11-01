# routes/touristinfo_route_recepcionista.py
from flask import Blueprint, request, jsonify, render_template
from sqlalchemy.exc import IntegrityError
from models.db import db
from models.tourist_site import TouristSite
from models.touristinfo import TouristInfo
from utils.decorators import role_required
from utils.utils import log_action
touristinfo_recep_bp = Blueprint("touristinfo_recep_bp", __name__, url_prefix="/api/touristinfo_recep")

# ---------------- Crear TouristInfo (solo receptionist) ----------------
@touristinfo_recep_bp.route("/", methods=["POST"])
@role_required("receptionist")
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

        # 🔹 Validación adicional
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
        log_action(current_user.id_user, f"Receptionist created tourist info {new_tourist.id_turist}")
        return jsonify(new_tourist.serialize()), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



# ---------------- Editar / actualizar TouristInfo (solo receptionist) ----------------
@touristinfo_recep_bp.route("/<int:tourist_id>", methods=["PATCH"])
@role_required("receptionist")
def update_tourist(current_user, tourist_id):
    tourist = TouristInfo.query.get(tourist_id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    # Cambié aquí para aceptar form-data
    data = request.form.to_dict() or request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    for field in ["nationality", "province", "quantity", "person_with_disability", "mobility"]:
        if field in data and str(data[field]).strip():
            setattr(tourist, field, data[field])

    try:
        # Convertir a int para validación lógica
        quantity = int(tourist.quantity)
        person_with_disability = int(tourist.person_with_disability)

        if person_with_disability > quantity:
            db.session.rollback()
            return jsonify({"error": "La cantidad de personas con discapacidad no puede ser mayor al total de personas"}), 400

        db.session.commit()
        log_action(current_user.id_user, f"Receptionist updated tourist info {tourist_id}")
        return jsonify(tourist.serialize()), 200

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ---------------- Reactivar TouristInfo (solo receptionist) ----------------
@touristinfo_recep_bp.route('/<int:id>/reactivate', methods=['PUT'])
@role_required("receptionist")
def reactivate_touristinfo(current_user, id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Información turística no encontrada"}), 404

    try:
        tourist.is_active = True
        db.session.commit()
        log_action(current_user.id_user, f"Receptionist reactivated tourist info {id}")
        return jsonify({"message": "Reactivado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ---------------- Eliminar TouristInfo (solo receptionist) ----------------
@touristinfo_recep_bp.route("/<int:tourist_id>", methods=["DELETE"])
@role_required("receptionist")
def delete_tourist(current_user, tourist_id):
    tourist = TouristInfo.query.get(tourist_id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    try:
        # 🔹 Borrado lógico
        tourist.is_active = False
        db.session.commit()
        log_action(current_user.id_user, f"Receptionist deactivated tourist info {tourist_id}")
        return jsonify({"message": "Turista eliminado (marcado como inactivo) correctamente."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



    
#---------------- Lista receptionist / CRUD (Carga la vista con JS) ----------------
@touristinfo_recep_bp.route("/list", endpoint="list_tourists_page_recep")
def list_tourists_view():
    tourists = TouristInfo.query.all()
    return render_template("touristinfo/touristinforecep/touristinfo_recep.html", tourists=tourists)


