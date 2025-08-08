from marshmallow import Schema, fields, validate
from enums.roles_enums import RoleEnum

class UserRegisterDTO(Schema):
    first_name=fields.String(required=True, validate=validate.Length(min=1))
    last_name=fields.String(required=True, validate=validate.Length(min=1))
    email=fields.Email(required=True)
    password=fields.String(required=True,validate=validate.Length(min=8))
    username=fields.String(required=True, validate=validate.Length(min=1))
    rol = fields.String(required=True, validate=validate.OneOf([r.value for r in RoleEnum]))
    dni = fields.String(required=True)
    birthdate= fields.Date(required=True)
    photo = fields.String(allow_none=True)
    phone=fields.String(required=True)
    nationality=fields.String(required=True)
    province=fields.String(required=True)
    is_activate = fields.Boolean(required=False, load_default=True)