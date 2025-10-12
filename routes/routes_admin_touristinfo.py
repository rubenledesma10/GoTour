# routes/touristinfo_route.py
from flask import Blueprint, request, jsonify, render_template
#from flask_login import login_required, current_user
from models.db import db
from models.touristinfo import TouristInfo
from utils.decorators import role_required

touristinfo_bp = Blueprint("touristinfo_bp", __name__, url_prefix="/touristinfo")

# -------- RUTA HTML --------
@touristinfo_bp.route("/", endpoint="touristinfo_view")
def touristinfo_view():
    tourists = TouristInfo.query.all()
    role = getattr(current_user, "role", None)
    return render_template("touristinfo/touristinfo.html", tourists=tourists, role=role)


# -------- API JSON --------
@touristinfo_bp.route("/api/all", methods=["GET"])
# @login_required
def get_all_tourists():
    tourists = TouristInfo.query.all()
    return jsonify([t.serialize() for t in tourists]), 200


@touristinfo_bp.route("/api/create", methods=["POST"])
# @login_required
def create_tourist():
    data = request.get_json() or request.form.to_dict()
    required = ["nationality", "province", "quantity", "person_with_disability", "mobility"]
    if not all(f in data and str(data[f]).strip() for f in required):
        return jsonify({"error": "All fields are required"}), 400

    try:
        new_tourist = TouristInfo(
            nationality=data["nationality"].strip(),
            province=data["province"].strip(),
            quantity=int(data["quantity"]),
            person_with_disability=int(data["person_with_disability"]),
            mobility=data["mobility"].strip(),
            id_user=current_user.id_user
        )
        db.session.add(new_tourist)
        db.session.commit()
        return jsonify({"success": True, "tourist": new_tourist.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@touristinfo_bp.route("/api/<int:id>", methods=["PATCH"])
# @login_required
def update_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    data = request.get_json() or request.form.to_dict()
    for field in ["nationality", "province", "quantity", "person_with_disability", "mobility"]:
        if field in data and str(data[field]).strip():
            setattr(tourist, field, data[field])

    try:
        db.session.commit()
        return jsonify({"success": True, "tourist": tourist.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@touristinfo_bp.route("/api/<int:id>", methods=["DELETE"])
# @login_required
def delete_tourist(id):
    tourist = TouristInfo.query.get(id)
    if not tourist:
        return jsonify({"error": "Tourist not found"}), 404

    try:
        db.session.delete(tourist)
        db.session.commit()
        return jsonify({"success": True, "message": "Tourist deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
