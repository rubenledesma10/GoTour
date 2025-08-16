from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models.db import db
from models.user import User
from datetime import datetime, date
from enums.roles_enums import RoleEnum
from dtos.user_register_dto import UserRegisterDTO
from dtos.user_login_dto import UserLoginDTO
from marshmallow import Schema, fields, ValidationError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from utils.decorators import role_required

tourist_bp = Blueprint('tourist_bp', __name__, url_prefix='/api/tourist')

@tourist_bp.route("/welcome", methods=["GET"])
@jwt_required()
@role_required(RoleEnum.TOURIST.value)
def test_turist():
    return jsonify({"message":"Endpoint for tourist "})