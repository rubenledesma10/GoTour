# # routes/touristinfo_route_recepcionista.py
# from flask import Blueprint, request, jsonify, render_template
# from sqlalchemy.exc import IntegrityError
# from models.db import db
# from models.touristinfo import TouristInfo
# from utils.decorators import role_required

# touristinfo_recep_bp = Blueprint("touristinfo_recep_bp", __name__, url_prefix="/api/touristinfo_recep")

# # ---------------- Lista recepcionist / CRUD (Carga la vista con JS) ----------------
# @touristinfo_recep_bp.route("/list", endpoint="list_tourists_page_recep")
# def list_tourists_view():
#     tourists = TouristInfo.query.all()
#     return render_template("touristinfo/touristinfo.html", tourists=tourists)

# # ---------------- Crear TouristInfo (solo recepcionist) ----------------
# @touristinfo_recep_bp.route("/", methods=["POST"])
# @role_required("recepcionist")
# def create_tourist(current_user):
#     data = request.form.to_dict() or request.get_json()
#     if not data:
#         return jsonify({"error": "Invalid data"}), 400

#     required_fields = ["nationality", "province", "quantity", "person_with_disability", "mobility"]
#     missing_fields = [f for f in required_fields if f not in data or str(data[f]).strip() == ""]
#     if missing_fields:
#         return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

#     try:
#         new_tourist = TouristInfo(
#             nationality=data["nationality"].strip(),
#             province=data["province"].strip(),
#             quantity=int(data["quantity"]),
#             person_with_disability=int(data["person_with_disability"]),
#             mobility=data["mobility"].strip(),
#             id_user=current_user.id_user
#         )
#         db.session.add(new_tourist)
#         db.session.commit()
#         return jsonify(new_tourist.serialize()), 201
#     except IntegrityError as e:
#         db.session.rollback()
#         return jsonify({"error": "Data conflict", "details": str(e)}), 409
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

# # ---------------- Editar / actualizar TouristInfo (solo recepcionist) ----------------
# @touristinfo_recep_bp.route("/<int:tourist_id>", methods=["PATCH"])
# @role_required("recepcionist")
# def update_tourist(current_user, tourist_id):
#     tourist = TouristInfo.query.get(tourist_id)
#     if not tourist:
#         return jsonify({"error": "Tourist not found"}), 404

#     data = request.get_json()
#     if not data:
#         return jsonify({"error": "Invalid data"}), 400

#     for field in ["nationality", "province", "quantity", "person_with_disability", "mobility"]:
#         if field in data and str(data[field]).strip():
#             setattr(tourist, field, data[field])

#     try:
#         db.session.commit()
#         return jsonify(tourist.serialize()), 200
#     except IntegrityError as e:
#         db.session.rollback()
#         return jsonify({"error": "Data conflict", "details": str(e)}), 409
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

# # ---------------- Eliminar TouristInfo (solo recepcionist) ----------------
# @touristinfo_recep_bp.route("/<int:tourist_id>", methods=["DELETE"])
# @role_required("recepcionist")
# def delete_tourist(current_user, tourist_id):
#     tourist = TouristInfo.query.get(tourist_id)
#     if not tourist:
#         return jsonify({"error": "Tourist not found"}), 404

#     try:
#         db.session.delete(tourist)
#         db.session.commit()
#         return jsonify({"message": "Tourist deleted successfully"}), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500 
# 
# 
