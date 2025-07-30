from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models.db import db
from models.tourist_site import TouristSite
#from models.district import District 

tourist_site = Blueprint('tourist_site', __name__)

@tourist_site.route('/api/tourist_sites', methods=['GET'])
def get_tourist_sites():
    # Obtener el parámetro de consulta 'district_id' de la URL
    # Si el usuario hace /api/tourist_sites?district_id=X, request.args.get('district_id') tomará el valor.
    # Si no lo proporciona, será None. 'type=int' intenta convertirlo a entero.
    district_id = request.args.get('district_id', type=int)

    # Iniciar la consulta base para todos los sitios turísticos
    query = TouristSite.query

    # Si se proporcionó un district_id, aplica el filtro
    if district_id is not None:
        # Validamos que el district_id realmente existe en la tabla District
        # Esto nos ayuda a evitar errores si alguien pasa un ID de distrito inválido.
        # if not District.query.get(district_id):
        #     return jsonify({'message': f'District with ID {district_id} not found.'}), 400
        # Aplica el filtro por la columna id_district
        query = query.filter_by(id_district=district_id)

    # Ejecutamos la consulta para obtener los sitios (ya sea por filtro o todos)
    tourist_sites = query.all()

    # Verificamos si hay sitios turisticos activos.
    if not tourist_sites:
        # DEVolvera un 200 OK con una lista vacía o un mensaje si no hay resultados
        if district_id is not None:
            return jsonify({'message': f'No tourist sites found for district ID {district_id}.', 'data': []}), 200
        else:
            return jsonify({'message': 'No tourist sites registered.', 'data': []}), 200
    # Serializamos la lista de sitios turísticos
    serialized_sites = [site.serialize() for site in tourist_sites]

    # Devolver la lista serializada
    return jsonify(serialized_sites), 200

@tourist_site.route('/api/tourist_sites/<int:id_tourist_site>', methods = ['GET'])
def get_tourist_site_id(id_tourist_site):
    tourist_site = TouristSite.query.get(id_tourist_site)
    if not tourist_site:
        return jsonify ({'message' : 'Tourist site not found'}), 404
    return jsonify(tourist_site.serialize()), 200

@tourist_site.route('/api/tourist_sites/<int:id_tourist_site>', methods = ['DELETE'])

def delete_tourist_site(id_tourist_site):
    tourist_site = TouristSite.query.get(id_tourist_site)

    if not tourist_site: 
        return jsonify ({'messagge' : 'Tourist not found'}), 404
    
    try: 
        db.session.delete(tourist_site)
        db.session.commit()
        return jsonify({'message': 'Tourist Site delete successfully'})
    
    except Exception as e: 
        db.session.rollback()
        return jsonify ({'error': str(e)})

@tourist_site.route('/api/tourist_sites/', methods = ['POST'])

def add_tourist_site():
    data = request.get_json()

    required_fields = ['name','description','address','phone','category','url','average','id_user','id_district']

    if not data or not all (key in data for key in required_fields):
        return jsonify ({'error':'Required data is missing'}), 400
    
    for field in ['name','description','address','phone','category','url']:
        if not str(data.get(field,'')).strip():
            return jsonify({'error': f'{field.title()} is required and cannot be empty'})
    #Validamos de que el promedio se ingrese a la hora de añadir un nuevo Tourist Site
    if 'average' in data and not isinstance(data['average'], (int, float, type(None))):
        return jsonify({'error': 'Average must be a number or null.'}), 400
    try: 
        print(f"Date received {data}")

        new_tourist_site = TouristSite(
            data['name'],
            data['description'],
            data['address'],
            data['phone'],
            data['category'],
            data['url'],
            data['average'],
            data['id_user'],
            data['id_district'],
        )
        
        db.session.add(new_tourist_site)
        db.session.commit()

        return jsonify({
            "message": "Tourist site created successfully",
            "tourist_site": new_tourist_site.serialize()
        }), 201
    
    except IntegrityError as e:
        db.session.rollback()
        error_msg_lower = str(e.orig).lower() 
        #Implementamos el error 409 para un mejor manejo en la unicidad de los atributos
        if 'unique constraint' in error_msg_lower:
            if 'tourist_site_url_key' in error_msg_lower: 
                return jsonify({'error': 'The URL is already registered.'}), 409
            elif 'tourist_site_name_key' in error_msg_lower:
                return jsonify({'error': 'The name is already registered.'}), 409
            elif 'tourist_site_address_key' in error_msg_lower: 
                return jsonify({'error': 'The address is already registered.'}), 409
            elif 'tourist_site_category_key' in error_msg_lower: 
                return jsonify({'error': 'The category is already used by another site.'}), 409
        elif 'foreign key constraint' in error_msg_lower: #Mejoramos el manejo de Foreign Key's
            # Esto captura errores si id_user o id_district no existen en sus tablas respectivas
            print(f"Foreign Key error: {error_msg_lower}")
        return jsonify({'error': 'Referenced user or district does not exist.'}), 404 #Not found
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error: {e}")
        return jsonify({'error':'Error adding Tourist Site'}), 500

@tourist_site.route('/api/tourist_sites/<int:id_tourist_site>', methods = ['PUT'])

def edit_tourist_site(id_tourist_site):
    data = request.get_json()
    tourist_site = TouristSite.query.get(id_tourist_site)

    required_fields = ['name','description','address','phone','category','url','id_user','id_district']

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
            
        db.session.commit()
        return jsonify({'message': 'Tourist Site update correctly'}), 200
        
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
    
@tourist_site.route('/<int:id_tourist_site>', methods = ['PATCH'])

def update_tourist_site(id_tourist_site):
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data received'}), 400

    tourist_site_to_update = TouristSite.query.get(id_tourist_site)  
    if not tourist_site_to_update:
        return jsonify({'message': 'client not found'}), 404

    updated = False  # Variable para rastrear si se realizó alguna actualización

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

        if updated:
            db.session.commit()
            return jsonify({'message': 'Client updated correctly'}), 200
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