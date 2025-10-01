from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models.db import db
from models.tourist_site import TouristSite
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from schemas.user_register_schema import user_schema, users_schema
from marshmallow import Schema, fields, ValidationError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from utils.decorators import role_required
from flask import render_template, request, redirect, url_for, flash  
import uuid
from utils.decorators import role_required
from models.user import User

tourist_site = Blueprint('tourist_site', __name__)

# -------------------------------------------------------------------------------- #
        # Rutas para renderizar las plantillas de los sitios turísticos.

@tourist_site.route('/tourist_sites/view', methods=['GET'])

def tourist_sites_view():
        sites = TouristSite.query.all()
        return render_template('tourist_site/tourist_sites.html', sites=sites)



    #Ruta para acceder a traves del boton al formulario de agregar sitio turistico. 
@tourist_site.route('/tourist_sites/add', methods=['GET', 'POST'])
#@role_required("admin")
def add_tourist_site_form():
    return render_template('tourist_site/add_tourist_sites.html')

    #Ruta para acceder al formulario a traves del boton, asi podemos editar la informacion del sitio turistico. 
@tourist_site.route('/tourist_sites/edit', methods=['GET'])
#@role_required("admin")
def edit_tourist_site_form():
    sites = TouristSite.query.all()
    return render_template('tourist_site/edit_tourist_sites.html', sites=sites)

    #Ruta para acceder al formulario a traves del boton, asi podemos eliminar de manera logica el sitio turistico. 
@tourist_site.route('/tourist_sites/delete', methods=['GET'])
#@role_required("admin")
def delete_tourist_site_form():
    sites = TouristSite.query.all()
    return render_template('tourist_site/delete_tourist_sites.html', sites=sites)


# --------------------------------------------------------------------------------- #
    # Estos son los endpoint para el CRUD de sitios turísticos.
        # Crear, editar y eliminar sitios turísticos.
@tourist_site.route('/api/tourist_sites', methods=['GET'])
@role_required("admin")
def get_tourist_sites(current_user):
    tourist_sites = TouristSite.query.all()

    # Verificamos si hay sitios turísticos activos
    if not tourist_sites:
        return jsonify({'message': 'No tourist sites registered.', 'data': []}), 200

    serialized_sites = [site.serialize() for site in tourist_sites]

    return jsonify(serialized_sites), 200


@tourist_site.route('/api/tourist_sites/<id_tourist_site>', methods=['GET'])
@role_required("admin")
def get_tourist_site_id(current_user, id_tourist_site):
    tourist_site = TouristSite.query.filter_by(id_tourist_site=id_tourist_site).first()
    
    if not tourist_site:
        return jsonify({'message': 'Tourist site not found'}), 404
    return jsonify(tourist_site.serialize()), 200


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



@tourist_site.route('/api/add_tourist_sites', methods=['POST'])
@role_required("admin")
def add_tourist_site(current_user):
    data = request.get_json()

    required_fields = ['name','description','address','phone','category','url', 'opening_hours', 'closing_hours','average', 'is_activate']

    # Validación de campos vacíos
    for field in required_fields:
        value = data.get(field)
        if value is None or str(value).strip() == '':
            return jsonify({'error': f'{field.title()} is required and cannot be empty'}), 400

    try:
        # Obtengo el id_user desde el token
        id_user = current_user.id_user
        if not id_user:
            return jsonify({'error': 'User not found in token'}), 400

        # Restricción para valores duplicados
        existing_site = TouristSite.query.filter(
            (TouristSite.name == data.get('name')) |
            (TouristSite.address == data.get('address')) |
            (TouristSite.url == data.get('url'))
        ).first()
        if existing_site:
            return jsonify({'error': 'Name, address or URL already exists'}), 409

        # Hacemos el parseo de los datos, es decir, convertirlos de string a su tipo correspondiente
        opening_hours = datetime.strptime(data.get('opening_hours'), "%H:%M").time() if data.get('opening_hours') else None
        closing_hours = datetime.strptime(data.get('closing_hours'), "%H:%M").time() if data.get('closing_hours') else None
        average = float(data.get('average', 0))
        is_activate = str(data.get('is_activate', 'true')).lower() in ('true', '1')

        # Crear el sitio turístico
        new_tourist_site = TouristSite(
            name=data.get('name'),
            description=data.get('description'),
            address=data.get('address'),
            phone=data.get('phone'),
            category=data.get('category'),
            url=data.get('url'),
            opening_hours=opening_hours,
            closing_hours=closing_hours,
            average=average,
            is_activate=is_activate,
            id_user=id_user
        )

        db.session.add(new_tourist_site)
        db.session.commit()

        return jsonify({
            "message": "Tourist site created successfully",
            "tourist_site": new_tourist_site.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error adding Tourist Site: {str(e)}'}), 500


@tourist_site.route('/api/tourist_sites/<id_tourist_site>', methods = ['PUT'])
@role_required("admin")

def edit_tourist_site(current_user, id_tourist_site):
        data = request.get_json()
        tourist_site = TouristSite.query.get(id_tourist_site)

        required_fields = ['name','description','address','phone','category','url', 'opening_hours', 'closing_hours']

        if not data: 
            return jsonify({'error':'No data received'}), 400
        
        if not tourist_site:
            return jsonify({'message':'Tourist Site not found'}), 404
        
        for field in required_fields:
            if not str(data.get(field,'')).strip():
                return jsonify({'error': f'{field.title()} is required and cannot be empty'}), 400
        
        try: 
            if 'name' in data:
                tourist_site.name = data ['name']
            if 'description' in data:
                tourist_site.description = data ['description']
            if 'address' in data: 
                tourist_site.address = data ['address']
            if 'phone' in data:
                tourist_site.phone = data ['phone']
            if 'category' in data: 
                tourist_site.category = data ['category']
            if 'url' in data: 
                tourist_site.url = data ['url']
            if 'opening_hours' in data:
                tourist_site.opening_hours = datetime.strptime(data['opening_hours'], "%H:%M").time() if data.get('opening_hours') else None
            if 'closing_hours' in data:
                tourist_site.closing_hours = datetime.strptime(data['closing_hours'], "%H:%M").time() if data.get('closing_hours') else None
            if 'average' in data:
                tourist_site.average = float(data['average']) if data.get('average') else None
                
            db.session.commit()
            return jsonify({'message': 'Tourist Site update correctly'}), 200
            
        except IntegrityError as e: 
            db.session.rollback()
            error_msg = str(e.orig).lower()
            if 'name' in error_msg:
                return jsonify({'error':'The name is al ready registred'}), 400
            elif 'url' in error_msg:
                return jsonify({'error':'The url is al ready registred'}), 400
            elif 'address' in error_msg:
                return jsonify({'error':'The url is al ready registred'}), 400
        except Exception as e: 
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        
@tourist_site.route('/api/tourist_sites/<id_tourist_site>', methods = ['PATCH'])
@role_required("admin")

def update_tourist_site(id_tourist_site):
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data received'}), 400

        tourist_site_to_update = TouristSite.query.get(id_tourist_site)  
        if not tourist_site_to_update:
            return jsonify({'message': 'Tourist Site not found'}), 404

        updated = False  # Variable para rastrear si se realizó alguna actualización.

        try:
            if 'name' in data:
                if str(data['name']).strip():
                    tourist_site_to_update.name = data['name']
                    updated = True
            if 'description' in data:
                if str(data['url']).strip():
                    tourist_site_to_update.description = data['description']
                    updated = True
            if 'address' in data:
                if str(data['district_address']).strip():
                    tourist_site_to_update.address = data['address']
                    updated = True
            if 'phone' in data:
                if str(data['street_address']).strip():
                    tourist_site_to_update.phone = data['phone']
                    updated = True
            if 'category' in data:
                if str(data['category']).strip():
                    tourist_site_to_update.category= data['category']
                    updated = True
            if 'url' in data:
                if str(data['url']).strip():
                    tourist_site_to_update.url= data['url']
                    updated = True
            if 'opening_hours' in data:
                tourist_site_to_update.opening_hours = data['opening_hours']
                updated = True
            if 'closing_hours' in data:
                tourist_site_to_update.closing_hours = data['closing_hours']
                updated = True

            if updated:
                db.session.commit()
                return jsonify({'message': 'Tourist_Site updated correctly'}), 200
            else:
                return jsonify({'message': 'No valid data received for update'}), 400
            
        except IntegrityError as e: 
            db.session.rollback()
            error_msg = str(e.orig).lower()
            if 'name' in error_msg:
                return jsonify({'error':'The name is al ready registred'}), 400
            elif 'url' in error_msg:
                return jsonify({'error':'The url is al ready registred'}), 400
            elif 'category' in error_msg:
                return jsonify({'error':'The category is al ready registred'}), 400
            elif 'address' in error_msg:
                return jsonify({'error':'The url is al ready registred'}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

