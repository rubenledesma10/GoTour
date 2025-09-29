from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify, render_template
from models.db import db
from models.cit import Cit

cit_bp = Blueprint("cit_bp", __name__, url_prefix="/api/cit")


def checkbox_to_bool(value):
    return str(value).lower() in ["on", "1", "true", "yes"] if value else False #PARA QUE NO ME DE EL ERROR DE LA TILDE EN ACTIVO


@cit_bp.route("/list", endpoint="list_cits_page")
def list_cit_page():
    cits = Cit.query.all()
    return render_template("cits/list_cit.html", cits=cits)


@cit_bp.route("/", methods=["GET"])
def get_all_cit():
    cits = Cit.query.all()
    if not cits:
        return jsonify({"message": "There are no Cits registered"}), 404
    return jsonify([c.serialize() for c in cits]), 200


@cit_bp.route("/<int:id_cit>", methods=["GET"])
def get_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    return jsonify(cit.serialize()), 200


@cit_bp.route("/", methods=["POST"])
def create_cit():
    current_user_id = "39c6fd66-5883-44fa-8017-86e12e154a2b"  # Usuario fijo de prueba

    data = request.form.to_dict()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    required_fields = ["district", "address", "number_cit"]
    missing_fields = [f for f in required_fields if f not in data or str(data[f]).strip() == ""]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    existing_number = Cit.query.filter_by(number_cit=data["number_cit"]).first()
    if existing_number:
        return jsonify({"error": f"number_cit '{data['number_cit']}' already exists"}), 400

    try:
        new_cit = Cit(
        district=data["district"].strip(),
        address=data["address"].strip(),
        number_cit=data["number_cit"],
        id_user=current_user_id,
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


@cit_bp.route("/<int:id_cit>", methods=["PATCH"])
def patch_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404

    data = request.form.to_dict()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    allowed_fields = ["number_cit", "district", "address", "is_activate", "is_activate_qr_map"]
    for field in data:
        if field in allowed_fields:
            value = data[field]
            if value in [None, ""]:
                return jsonify({"error": f"Field '{field}' cannot be empty"}), 400
            if field in ["is_activate", "is_activate_qr_map"]:
                value = checkbox_to_bool(data.get(field))
            setattr(cit, field, value)

        else:
            return jsonify({"error": f"Field '{field}' cannot be updated"}), 400

    try:
        db.session.commit()
        return jsonify(cit.serialize()), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@cit_bp.route("/<int:id_cit>", methods=["PUT"])
def update_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404

    data = request.form.to_dict()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    required_fields = ["district", "address", "number_cit"]
    missing_fields = [f for f in required_fields if f not in data or data[f] in [None, ""]]
    if missing_fields:
        return jsonify({"error": f"Missing or empty required fields: {', '.join(missing_fields)}"}), 400

    allowed_fields = ["number_cit", "district", "address", "is_activate", "is_activate_qr_map"]
    for field in allowed_fields:
        if field in data:
            if field in ["is_activate", "is_activate_qr_map"]:
                value = checkbox_to_bool(data.get(field))
            setattr(cit, field, value)


    try:
        db.session.commit()
        return jsonify(cit.serialize()), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Data conflict", "details": str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@cit_bp.route("/<int:id_cit>/delete", methods=["POST", "DELETE"])  
def delete_cit(id_cit):
    cit = Cit.query.get(id_cit)
    if not cit:
        return jsonify({"error": "Cit not found"}), 404
    try:
        db.session.delete(cit)
        db.session.commit()
        return jsonify({"message": "Cit deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

