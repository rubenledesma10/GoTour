from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request, render_template
from models.db import db
from models.user import User
from flask import current_app as app
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from schemas.user_register_schema import user_schema, users_schema
from marshmallow import Schema, fields, ValidationError
from utils.decorators import role_required


tourist_bp = Blueprint('tourist_bp', __name__, url_prefix='/api/tourist')

@tourist_bp.route("/welcome", methods=["GET"])
@role_required("tourist")
def test_tourist(current_user):
    return jsonify({"message":"Endpoint for tourist "})

@tourist_bp.route("/dashboard", methods=["GET"])
@role_required("tourist")
def dashboard_tourist_api(current_user):
    return jsonify({
        'username':current_user.username,
        'role':current_user.role
    })

@tourist_bp.route("/users_page", methods=["GET"])
def users_page():
    return render_template("user/user_card.html")

@tourist_bp.route('/get')
@role_required("tourist")
def get_tourist_data(current_user):
    if not current_user:
        return jsonify({'message': 'User not found or not logged in'}), 404
    return jsonify(user_schema.dump(current_user)), 200

@tourist_bp.route('/delete/<string:id_user>', methods=['DELETE'])
@role_required("tourist")
def delete_user(current_user, id_user):
    if str(current_user.id_user) != id_user: 
        return jsonify({'message': 'Access Denied. You can only deactivate your own account.'}), 403

    user = current_user
    
    try:
        user.is_activate = False
        db.session.commit()
        return jsonify({'message': 'User deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal error occurred'}), 500 

# @tourist_bp.route("/my_data/edit", methods=['PUT'])
# @role_required("tourist")
# def edit_my_data():
#     id_user=get_jwt_identity()
#     user=User.query.get(id_user)
#     if not user:
#         return jsonify({"error":"User not found"}),404
#     data=request.get_json()
#     if not data:
#         return jsonify({'error':'No data received'}),400
#     try:
#         validated_data=user_schema.load(data, partial=True)
#     except ValidationError as err:
#         return jsonify(err.messages),400
#     try:
#         if 'first_name' in validated_data:
#             user.first_name = validated_data['first_name']

#         if 'last_name' in validated_data:
#             user.last_name = validated_data['last_name']

#         if 'email' in validated_data:
#             user.email = validated_data['email'].lower()

#         if 'username' in validated_data:
#             user.username = validated_data['username']

#         if 'role' in validated_data:
#             user.rol = validated_data['role']

#         if 'dni' in validated_data:
#             user.dni = validated_data['dni']

#         if 'birthdate' in validated_data:
#             user.birthdate = validated_data['birthdate']

#         if 'photo' in validated_data:
#             user.photo = validated_data['photo']

#         if 'phone' in validated_data:
#             user.phone = validated_data['phone']

#         if 'nationality' in validated_data:
#             user.nationality = validated_data['nationality']

#         if 'province' in validated_data:
#             user.province = validated_data['province']

#         if 'is_activate' in validated_data:
#             user.is_activate = validated_data['is_activate']

#         if 'password' in validated_data:
#             user.set_password(validated_data['password'])

#         if 'gender' in validated_data:
#             user.gender = validated_data['gender']

#         db.session.commit()
#         return jsonify({'message': 'User edited correctly', 'user':  user_schema.dump(user)}), 200
#     except IntegrityError as e:
#         db.session.rollback()
#         return jsonify({'error': 'Database integrity error: ' + str(e)}), 400
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500
