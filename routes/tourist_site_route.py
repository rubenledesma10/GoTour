from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models.db import db
# from models.feedBack import Feedback 
from models.tourist_site import TouristSite
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from schemas.user_register_schema import user_schema, users_schema
from marshmallow import Schema, fields, ValidationError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from utils.decorators import role_required
from flask import render_template, request, redirect, url_for, flash  
import uuid, os
from utils.decorators import role_required
from flask import current_app
from models.user import User
from werkzeug.utils import secure_filename
from utils.file_helpers import allowed_file
from marshmallow import ValidationError
from schemas.tourist_site_schema import tourist_site_schema


tourist_site = Blueprint('tourist_site', __name__)

# --------------------------------------------------------------------------------- #
    # Estos son los endpoint para el CRUD de sitios turísticos.
        # Crear, editar y eliminar sitios turísticos.



@tourist_site.route('/api/tourist_sites', methods=['GET'])

def get_tourist_sites():
    query = request.args.get('q', '').strip().lower()
    category = request.args.get('category', '').strip().lower()
    is_active = request.args.get('is_active', '').strip().lower()

    sites_query = TouristSite.query

    if query:
        sites_query = sites_query.filter(
            db.or_(
                db.func.lower(TouristSite.name).like(f"%{query}%"),
                db.func.lower(TouristSite.description).like(f"%{query}%"),
                db.func.lower(TouristSite.address).like(f"%{query}%")
            )
        )

    if category:
        sites_query = sites_query.filter(TouristSite.category.ilike(f"%{category}%"))

    if is_active:
        if is_active == 'true':
            sites_query = sites_query.filter_by(is_activate=True)
        elif is_active == 'false':
            sites_query = sites_query.filter_by(is_activate=False)

    tourist_sites = sites_query.all()

    if not tourist_sites:
        return jsonify({'message': 'No tourist sites found', 'data': []}), 200

    serialized_sites = []
    for site in tourist_sites:
        data = site.serialize()
        # 🖼️ Agregamos la URL completa del archivo
        if site.photo:
            data["photo"] = url_for('static', filename=f"tourist_sites_images/{site.photo}", _external=False)
        serialized_sites.append(data)

    return jsonify(serialized_sites), 200



@tourist_site.route('/api/tourist_sites/<id_tourist_site>', methods=['GET'])
@role_required("admin")
def get_tourist_site_id(current_user, id_tourist_site):
    tourist_site = TouristSite.query.filter_by(id_tourist_site=id_tourist_site).first()
    
    if not tourist_site:
        return jsonify({'message': 'Tourist site not found'}), 404
    return jsonify(tourist_site.serialize()), 200

# --------------------------------------------------------------------------------- #

@tourist_site.route('/api/tourist_sites/<id_tourist_site>', methods = ['DELETE'])

@role_required("admin")
def delete_tourist_site(current_user, id_tourist_site):
        tourist_site = TouristSite.query.get(id_tourist_site)

        if not tourist_site: 
            return jsonify ({'messagge' : 'Tourist not found'}), 404
        
        try: 
            tourist_site.is_activate = False #Directamente mantenemos inactivo el sitio. Eliminado logico.
            #Es decir, tenemos el espacio vacio, pero con la tabla creada.
            #db.session.delete(tourist_site)
            db.session.commit()
            return jsonify({'message': 'Tourist Site delete successfully'})
        
        except Exception as e: 
            db.session.rollback()
            return jsonify ({'error': str(e)})
        
# --------------------------------------------------------------------------------- #

@tourist_site.route('/api/add_tourist_sites', methods=['POST'])
@role_required("admin")
def add_tourist_site(current_user):
    data = request.form
    file = request.files.get('photo')

    # Validar los campos con el Schema
    try:
        validated_data = tourist_site_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    # Validamos imagen
    if not file or file.filename == '':
        return jsonify({"errors": {"photo": ["Image is required."]}}), 400
    if not allowed_file(file.filename):
        return jsonify({"errors": {"photo": ["Invalid file type."]}}), 400

    try:
        id_user = current_user.id_user
        # Evitamos duplicados
        existing = TouristSite.query.filter(
            (TouristSite.name == validated_data["name"]) |
            (TouristSite.address == validated_data["address"]) |
            (TouristSite.url == validated_data["url"])
        ).first()
        if existing:
            return jsonify({"errors": {"duplicate": ["Name, address or URL already exists."]}}), 409

        # Guardamos la imagen
        filename = secure_filename(file.filename)
        save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        file.save(save_path)

        # Crear y guardar sitio
        new_site = TouristSite(
            **validated_data,
            id_user=id_user,
            photo=filename
        )

        db.session.add(new_site)
        db.session.commit()

        return jsonify({
            "message": "Tourist site created successfully.",
            "tourist_site": new_site.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"errors": {"server": [f"Error adding Tourist Site: {str(e)}"]}}), 500
# --------------------------------------------------------------------------------- #

@tourist_site.route('/api/tourist_sites/<id_tourist_site>', methods=['PUT'])
@role_required("admin")
def edit_tourist_site(current_user, id_tourist_site):
    
    if not current_user or not current_user.id_user:
        return jsonify({'error': 'User not found in token'}), 400

    
    tourist_site = TouristSite.query.get(id_tourist_site)

    if not tourist_site:
        return jsonify({'error': 'Tourist Site not found'}), 404

    # Soporta tanto JSON, como FormData
    if request.content_type.startswith('multipart/form-data'):
        data = request.form
        file = request.files.get('photo')
    else:
        data = request.get_json()
        file = None

    required_fields = ['name', 'description', 'address', 'phone', 'category', 'url','opening_hours', 'closing_hours', 'average']

    # Validamos el data 
    if not data:
        return jsonify({'error': 'No data received'}), 400

    for field in required_fields:
        value = data.get(field)
        if value is None or str(value).strip() == '':
            return jsonify({'error': f'{field.title()} is required and cannot be empty'}), 400

    try:
        # Actualizamos los campos obligatorios
        tourist_site.name = data.get('name')
        tourist_site.description = data.get('description')
        tourist_site.address = data.get('address')
        tourist_site.phone = data.get('phone')
        tourist_site.category = data.get('category')
        tourist_site.url = data.get('url')

        # Parseamos los valores a los tipos correctos
        tourist_site.opening_hours = datetime.strptime(data.get('opening_hours'), "%H:%M").time()
        tourist_site.closing_hours = datetime.strptime(data.get('closing_hours'), "%H:%M").time()
        tourist_site.average = float(data.get('average'))
        tourist_site.is_activate = str(data.get('is_activate', 'true')).lower() in ('true', '1')

        # Imagen nueva 
        if file and file.filename != '':
            if not allowed_file(file.filename):
                return jsonify({'error': 'Invalid file type'}), 400

            filename = secure_filename(file.filename)

            # 🔥 fallback si no está definido en la config
            upload_folder = current_app.config.get(
                'UPLOAD_FOLDER',
                os.path.join(current_app.root_path, 'static', 'tourist_sites_images')
            )

            os.makedirs(upload_folder, exist_ok=True)
            save_path = os.path.join(upload_folder, filename)
            file.save(save_path)

            tourist_site.photo = filename  # reemplaza la imagen anterior


        db.session.commit()

        return jsonify({
            'message': 'Tourist site updated successfully',
            'tourist_site': tourist_site.serialize()
        }), 200

    except IntegrityError as e:
        db.session.rollback()
        error_msg = str(e.orig).lower()
        if 'name' in error_msg:
            return jsonify({'error': 'The name is already registered'}), 400
        elif 'url' in error_msg:
            return jsonify({'error': 'The URL is already registered'}), 400
        elif 'address' in error_msg:
            return jsonify({'error': 'The address is already registered'}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error updating Tourist Site: {str(e)}'}), 500

# --------------------------------------------------------------------------------- #

@tourist_site.route('/api/tourist_sites/<id_tourist_site>', methods=['PATCH'])
@role_required("admin")
def update_tourist_site(current_user, id_tourist_site):
    
    if not current_user or not current_user.id_user:
        return jsonify({'error': 'User not found in token'}), 400


    tourist_site = TouristSite.query.get(id_tourist_site)

    if not tourist_site:
        return jsonify({'error': 'Tourist Site not found'}), 404

    # Soporta tanto JSON como multipart/form-data
    if request.content_type.startswith('multipart/form-data'):
        data = request.form
        file = request.files.get('photo')
    else:
        data = request.get_json()
        file = None

    if not data and not file:
        return jsonify({'error': 'No data received'}), 400

    updated = False

    try:
        if 'name' in data and str(data['name']).strip():
            tourist_site.name = data['name']
            updated = True

        if 'description' in data and str(data['description']).strip():
            tourist_site.description = data['description']
            updated = True

        if 'address' in data and str(data['address']).strip():
            tourist_site.address = data['address']
            updated = True

        if 'phone' in data and str(data['phone']).strip():
            tourist_site.phone = data['phone']
            updated = True

        if 'category' in data and str(data['category']).strip():
            tourist_site.category = data['category']
            updated = True

        if 'url' in data and str(data['url']).strip():
            tourist_site.url = data['url']
            updated = True

        if 'average' in data and str(data['average']).strip():
            tourist_site.average = float(data['average'])
            updated = True

        if 'opening_hours' in data and str(data['opening_hours']).strip():
            tourist_site.opening_hours = datetime.strptime(data['opening_hours'], "%H:%M").time()
            updated = True

        if 'closing_hours' in data and str(data['closing_hours']).strip():
            tourist_site.closing_hours = datetime.strptime(data['closing_hours'], "%H:%M").time()
            updated = True

        if 'is_activate' in data:
            tourist_site.is_activate = str(data['is_activate']).lower() in ('true', '1')
            updated = True

        # Imagen nueva 
        if file and file.filename != '':
            if not allowed_file(file.filename):
                return jsonify({'error': 'Invalid file type'}), 400

            filename = secure_filename(file.filename)
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            file.save(save_path)

            tourist_site.photo = filename  # reemplazamos la foto anterior
            updated = True

        if updated:
            db.session.commit()
            return jsonify({
                'message': 'Tourist site updated successfully',
                'tourist_site': tourist_site.serialize()
            }), 200
        else:
            return jsonify({'message': 'No valid fields provided for update'}), 400

    except IntegrityError as e:
        db.session.rollback()
        error_msg = str(e.orig).lower()
        if 'name' in error_msg:
            return jsonify({'error': 'The name is already registered'}), 400
        elif 'url' in error_msg:
            return jsonify({'error': 'The URL is already registered'}), 400
        elif 'address' in error_msg:
            return jsonify({'error': 'The address is already registered'}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error updating Tourist Site: {str(e)}'}), 500

# --------------------------------------------------------------------------------- #
@tourist_site.route('/api/tourist_sites/<id_tourist_site>/reactivate', methods=['PUT']) #Endpoint para reactivar un sitio turistico.
@role_required("admin")
def reactivate_tourist_site(current_user, id_tourist_site):
    tourist_site = TouristSite.query.get(id_tourist_site)

    if not tourist_site:
        return jsonify({'error': 'Tourist Site not found'}), 404

    if tourist_site.is_activate:
        return jsonify({'message': 'Tourist site is already active'}), 400

    try:
        tourist_site.is_activate = True
        db.session.commit()
        return jsonify({
            'message': 'Tourist site reactivated successfully',
            'tourist_site': tourist_site.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error reactivating Tourist Site: {str(e)}'}), 500

# --------------------------------------------------------------------------------- # Endpoint para agregar un comentario a un sitio turistico.


# @tourist_site.route('/api/tourist_sites/<id_tourist_site>/feedback', methods=['POST'])
# @role_required("tourist")
# def add_feedback(current_user, id_tourist_site):
#     data = request.get_json()

#     # Validar datos
#     if not data or not data.get("comment"):
#         return jsonify({"error": "El campo 'comment' es obligatorio"}), 400

#     # Validar que el sitio exista
#     tourist_site = TouristSite.query.get(id_tourist_site)
#     if not tourist_site:
#         return jsonify({"error": "El sitio turístico no existe"}), 404

#     try:
#         new_feedback = Feedback(
#             id_user=current_user.id_user,
#             id_tourist_site=id_tourist_site,
#             comment=data["comment"].strip()
#         )

#         db.session.add(new_feedback)
#         db.session.commit()

#         return jsonify({
#             "message": "Comentario agregado con éxito",
#             "feedback": new_feedback.serialize()
#         }), 201

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": f"Error al agregar comentario: {str(e)}"}), 500

# -------------------------------------------------------------------------------- #
        # Rutas para renderizar las plantillas de los sitios turísticos.

@tourist_site.route('/tourist_sites/view', methods=['GET'])

def tourist_sites_view():
        sites = TouristSite.query.all()
        return render_template('tourist_site/tourist_sites.html', sites=sites)



    #Ruta para acceder a traves del boton al formulario de agregar sitio turistico. 
@tourist_site.route('/tourist_sites/add', methods=['GET', 'POST'])

def add_tourist_site_form():
    return render_template('tourist_site/add_tourist_sites.html')

    #Ruta para acceder al formulario a traves del boton, asi podemos editar la informacion del sitio turistico. 
@tourist_site.route('/tourist_sites/edit', methods=['GET'])

def edit_tourist_site_form():
    sites = TouristSite.query.all()
    return render_template('tourist_site/edit_tourist_sites.html', sites=sites)

    #Ruta para acceder al formulario a traves del boton, asi podemos eliminar de manera logica el sitio turistico. 
@tourist_site.route('/tourist_sites/delete', methods=['GET'])

def delete_tourist_site_form():
    sites = TouristSite.query.all()
    return render_template('tourist_site/delete_tourist_sites.html', sites=sites)