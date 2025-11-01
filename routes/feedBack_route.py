from flask import Blueprint, jsonify, request, render_template, current_app as app
from sqlalchemy.exc import IntegrityError
from models.db import db
from models.feedBack import feedBack, FeedbackPhoto
from models.user import User
from models.tourist_site import TouristSite
from schemas.feedBack_schema import feedback_schema
from enums.roles_enums import RoleEnum
from marshmallow import ValidationError
from datetime import datetime
import jwt, os, uuid
from utils.utils import log_action

feedback_bp = Blueprint("feedback_bp", __name__, url_prefix="/api/feedback") 

UPLOAD_FOLDER = "static/uploads"

# ✅ CAMBIO: lista básica de malas palabras
BAD_WORDS = {"puto", "puta", "sexo", "mierda", "imbecil", "pelotudo", "tonto", "estupido"}

def get_identity_from_header(optional=False):
    """Devuelve (id_user, error, code). Si optional=True, no requiere token."""
    auth_header = request.headers.get("Authorization")

    # Si no hay token y no es obligatorio → devolvemos None sin error
    if not auth_header:
        if optional:
            return None, None, None
        return None, {"error": "Token no proporcionado"}, 401

    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded["id_user"], None, None
    except jwt.ExpiredSignatureError:
        return None, {"error": "El token ha expirado"}, 401
    except jwt.InvalidTokenError:
        if optional:
            return None, None, None
        return None, {"error": "Token inválido"}, 401



@feedback_bp.route("/view")
def feedback_view():
    usuario = None
    auth_header = request.headers.get("Authorization")
    if auth_header:
        identity, err, code = get_identity_from_header()
        if not err:
            usuario = User.query.filter_by(id_user=identity).first()
    sites = TouristSite.query.all()
    return render_template("feedBack/usuario.html", usuario=usuario, sites=sites)


@feedback_bp.route("/add", methods=["GET"])
def feedback_add_form():
    site_id = request.args.get("site_id")
    site_name = request.args.get("name")

    site = None
    # Si hay un ID, buscamos el sitio
    if site_id:
        site = TouristSite.query.get(site_id)
        if site and not site_name:
            site_name = site.name

    # ✅ Si no hay site_id pero hay site_name, no devolvemos 404
    if not site and not site_name:
        # Si no se especificó ningún dato, mostramos el formulario general
        sites = TouristSite.query.all()
        return render_template(
            "feedBack/usuario.html",
            sites=sites,
            site=None,
            site_name=None,
            site_id=None
        )

    # ✅ Si venís desde un sitio específico
    return render_template(
        "feedBack/usuario.html",
        site=site,
        site_name=site_name,
        site_id=site_id
    )



# ✅ CAMBIO: versión con moderación automática
@feedback_bp.route("/", methods=["POST"])
def create_feedback():
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code

    user = User.query.filter_by(id_user=identity).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    if user.role == RoleEnum.ADMIN.value:
        return jsonify({"error": "Los administradores no pueden dejar comentarios"}), 403

    data = request.form.to_dict()
    files = request.files.getlist("photos")

    if len(files) > 10:
        return jsonify({"error": "Podés subir como máximo 10 fotos"}), 400

    comment = (data.get("comment") or "").strip()
    qualification = int(data.get("qualification", 0))
    id_tourist_site = data.get("id_tourist_site")

    if not comment:
        return jsonify({"error": "El comentario no puede estar vacío"}), 400
    if not (1 <= qualification <= 5):
        return jsonify({"error": "La calificación debe estar entre 1 y 5"}), 400

    site = TouristSite.query.get(id_tourist_site)
    if not site:
        return jsonify({"error": f"El sitio turístico con id {id_tourist_site} no existe"}), 404

    # ✅ CAMBIO: detección de lenguaje inapropiado
    lower_comment = comment.lower()
    has_bad_words = any(word in lower_comment for word in BAD_WORDS)

    new_feedback = feedBack(
        date_hour=datetime.utcnow(),
        comment=comment,
        qualification=qualification,
        id_user=user.id_user,
        id_tourist_site=id_tourist_site,
        is_approved=not has_bad_words  # ✅ CAMBIO: nuevo campo
    )

    try:
        db.session.add(new_feedback)
        db.session.flush()

        for file in files:
            if file:
                filename = f"{uuid.uuid4()}_{file.filename}"
                upload_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(upload_path)
                db.session.add(FeedbackPhoto(filename=filename, id_feedback=new_feedback.id_feedback))

        db.session.commit()
        log_action(user.id_user, f"User created feedback {new_feedback.id_feedback}")
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Error al registrar feedback", "detail": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    # ✅ CAMBIO: respuesta distinta si quedó pendiente
    if has_bad_words:
        return jsonify({
            "message": "Tu comentario quedó pendiente de revisión por lenguaje inapropiado.",
            "feedback": new_feedback.serialize()
        }), 201
    else:
        return jsonify({
            "message": "Comentario enviado correctamente.",
            "feedback": new_feedback.serialize()
        }), 201


@feedback_bp.route("/", methods=["GET"])
def get_feedbacks():
    try:
        identity, err, code = get_identity_from_header(optional=True)
        user_role = None
        user_id = None

        # ✅ Detectamos usuario si hay token
        if identity:
            user = User.query.filter_by(id_user=identity).first()
            if user:
                user_role = user.role
                user_id = user.id_user

        print("DEBUG ROL:", user_role, "==", RoleEnum.ADMIN.value)


        # ✅ CASO 1: Admin ve todos los comentarios
        if user_role == RoleEnum.ADMIN.value:
            feedbacks = (
                feedBack.query
                .order_by(feedBack.date_hour.desc())
                .all()
            )

        # ✅ CASO 2: Usuario logueado → aprobados + los suyos
        elif user_id:
            feedbacks = (
                feedBack.query
                .filter(
                    ((feedBack.is_approved == True) | (feedBack.id_user == user_id))
                    & (feedBack.is_deleted == False)
                )
                .order_by(feedBack.date_hour.desc())
                .all()
            )

        # ✅ CASO 3: Visitante (sin login) → solo aprobados
        else:
            feedbacks = (
                feedBack.query
                .filter_by(is_approved=True, is_deleted=False)
                .order_by(feedBack.date_hour.desc())
                .all()
            )

        return jsonify([f.serialize() for f in feedbacks]), 200

    except Exception as e:
        print("ERROR en get_feedbacks:", e)
        return jsonify({"error": str(e)}), 500





@feedback_bp.route("/<int:id>", methods=["PUT"])
def update_feedback(id):
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code
    user = User.query.filter_by(id_user=identity).first()
    if not user or user.role != RoleEnum.ADMIN.value:
        return jsonify({"error": "Debes iniciar sesión como administrador"}), 401

    feedback = feedBack.query.get(id)
    if not feedback:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    try:
        validated_data = feedback_schema.load(data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422

    if "comment" in validated_data:
        comment = validated_data["comment"].strip()
        if not comment:
            return jsonify({"error": "El comentario no puede estar vacío"}), 400
        feedback.comment = comment

    if "qualification" in validated_data:
        q = validated_data["qualification"]
        if q is None or not (1 <= q <= 5):
            return jsonify({"error": "La calificación debe estar entre 1 y 5"}), 400
        feedback.qualification = q

    try:
        db.session.commit()
        log_action(user.id_user, f"Admin updated feedback {id}")
        return jsonify({"feedback": feedback.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@feedback_bp.route("/<int:id>", methods=["DELETE"])
def delete_feedback(id):
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code

    user = User.query.filter_by(id_user=identity).first()
    if not user or user.role != RoleEnum.ADMIN.value:
        return jsonify({"error": "Debes iniciar sesión como administrador"}), 401

    feedback = feedBack.query.get(id)
    if not feedback:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404

    try:
        # 👇 CAMBIO: Borrado lógico
        feedback.is_deleted = True
        db.session.commit()
        log_action(user.id_user, f"Admin deleted feedback {id}")
        return jsonify({"message": "Feedback marcado como eliminado (borrado lógico)."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



@feedback_bp.route("/<int:id>/reply", methods=["POST"])
def reply_feedback(id):
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code
    user = User.query.filter_by(id_user=identity).first()
    if not user or user.role != RoleEnum.ADMIN.value:
        return jsonify({"error": "Solo los administradores pueden responder comentarios"}), 401

    feedback = feedBack.query.get(id)
    if not feedback:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404

    data = request.get_json()
    if not data or "response" not in data:
        return jsonify({"error": "Se requiere el campo 'response'"}), 400

    response_text = data["response"].strip()
    if not response_text:
        return jsonify({"error": "La respuesta no puede estar vacía"}), 400

    feedback.admin_response = response_text
    feedback.response_date = datetime.utcnow()
    feedback.admin_name = user.username

    feedback.admin_photo = user.photo if user and user.photo else "default_user.png"

    try:
        db.session.commit()
        log_action(user.id_user, f"Admin replied to feedback {id}")
        return jsonify({
            "message": "Respuesta registrada con éxito",
            "feedback": feedback.serialize()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@feedback_bp.route("/pending", methods=["GET"])
def get_pending_feedbacks():
    """Devuelve todos los comentarios que están pendientes de aprobación (is_approved=False)."""
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code

    user = User.query.filter_by(id_user=identity).first()
    if not user or user.role != RoleEnum.ADMIN.value:
        return jsonify({"error": "Solo los administradores pueden ver comentarios pendientes"}), 401

    try:
        pending_feedbacks = (
            feedBack.query.filter_by(is_approved=False,is_deleted=False)
            .order_by(feedBack.date_hour.desc())
            .all()
        )
        return jsonify([f.serialize() for f in pending_feedbacks]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@feedback_bp.route("/<int:id>/moderate", methods=["POST"])
def moderate_feedback(id):
    identity, err, code = get_identity_from_header()
    if err:
        return jsonify(err), code

    user = User.query.filter_by(id_user=identity).first()
    if not user or user.role != RoleEnum.ADMIN.value:
        return jsonify({"error": "Solo los administradores pueden moderar comentarios"}), 401

    feedback = feedBack.query.get(id)
    if not feedback:
        return jsonify({"error": f"Feedback con id {id} no encontrado"}), 404

    data = request.get_json()
    approve = data.get("approve")

    feedback.is_approved = bool(approve)

    try:
        db.session.commit()
        log_action(user.id_user, f"Admin {'approved' if approve else 'rejected'} feedback {id}")
        msg = "Comentario aprobado y publicado." if approve else "Comentario rechazado y ocultado."
        return jsonify({"message": msg}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
