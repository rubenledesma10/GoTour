# from flask import Blueprint, redirect, url_for, flash, render_template
# from flask_login import login_required, current_user
# from models.touristinfo import TouristInfo

# touristinfo_redirect_bp = Blueprint("touristinfo_redirect_bp", __name__)

# @touristinfo_redirect_bp.route("/touristinfo")
# @login_required
# def touristinfo_redirect():
#     role = getattr(current_user, "role", None)

#     if role not in ["admin", "receptionist"]:
#         flash("Permiso denegado", "danger")
#         return redirect(url_for("home"))

#     # Renderizamos directamente la misma plantilla para ambos roles
#     tourists = TouristInfo.query.all()
#     return render_template("touristinfo/touristinfo.html", tourists=tourists, role=role)



# # -------------------
# # Rutas HTML
# # -------------------

# @touristinfo_recep_bp.route("/")
# @login_required
# def touristinfo_planilla():
#     tourists = TouristInfo.query.all()
#     return render_template("touristinfo/touristinfo.html", tourists=tourists, role="receptionist")

# @touristinfo_recep_bp.route("/add")
# @role_required("receptionist")
# def add_touristinfo():
#     tourists = TouristInfo.query.all()
#     return render_template("touristinfo/add_touristinfo.html", tourists=tourists, role="receptionist")

# @touristinfo_recep_bp.route("/edit")
# @role_required("receptionist")
# def edit_touristinfo():
#     tourists = TouristInfo.query.all()
#     return render_template("touristinfo/edit_touristinfo.html", tourists=tourists, role="receptionist")

# @touristinfo_recep_bp.route("/delete")
# @role_required("receptionist")
# def delete_touristinfo():
#     tourists = TouristInfo.query.all()
#     return render_template("touristinfo/delete_touristinfo.html", tourists=tourists, role="receptionist")

# # -------------------
# # Rutas API (JSON)
# # -------------------

# @touristinfo_recep_bp.route("/api/all", methods=["GET"])
# @role_required("receptionist")
# def get_all_tourists():
#     tourists = TouristInfo.query.all()
#     return jsonify([t.serialize() for t in tourists]), 200

# @touristinfo_recep_bp.route("/api/<int:id>", methods=["PATCH"])
# @role_required("receptionist")
# def update_tourist(id):
#     tourist = TouristInfo.query.get(id)
#     if not tourist:
#         return jsonify({"error": "Tourist not found"}), 404
#     data = request.form.to_dict()
#     for field in ["nationality", "province", "quantity", "person_with_disability", "mobility"]:
#         if field in data and data[field].strip():
#             setattr(tourist, field, data[field])
#     try:
#         db.session.commit()
#         return jsonify(tourist.serialize()), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

# @touristinfo_recep_bp.route("/api/<int:id>", methods=["DELETE"])
# @role_required("receptionist")
# def delete_tourist(id):
#     tourist = TouristInfo.query.get(id)
#     if not tourist:
#         return jsonify({"error": "Tourist not found"}), 404
#     db.session.delete(tourist)
#     db.session.commit()
#     return jsonify({"message": "Tourist deleted"}), 200

# @touristinfo_recep_bp.route("/api/create", methods=["POST"])
# @role_required("receptionist")
# def create_tourist():
#     data = request.form.to_dict()
#     required = ["nationality", "province", "quantity", "person_with_disability", "mobility"]
#     if not all(f in data and data[f].strip() for f in required):
#         return jsonify({"error": "All fields are required"}), 400
#     try:
#         new_tourist = TouristInfo(
#             nationality=data["nationality"].strip(),
#             province=data["province"].strip(),
#             quantity=int(data["quantity"]),
#             person_with_disability=int(data["person_with_disability"]),
#             mobility=data["mobility"].strip(),
#             id_user="receptionist"  # Placeholder, reemplazar por ID real de sesión
#         )
#         db.session.add(new_tourist)
#         db.session.commit()
#         return jsonify(new_tourist.serialize()), 201
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

