from marshmallow import Schema, fields, validate #valida el json entrante y transforma a tipos Python
from enums.roles_enums import RoleEnum

class UserRegisterDTO(Schema):
    first_name=fields.String(required=True, validate=validate.Length(min=1)) #true le decimos que tiene que estar si o si, si no esta, Marshmallow lanza la excepcion 
    last_name=fields.String(required=True, validate=validate.Length(min=1))
    email=fields.Email(required=True) #le decimos que tiene que ser email
    password=fields.String(required=True,validate=validate.Length(min=8))
    username=fields.String(required=True, validate=validate.Length(min=1))
    rol = fields.String(required=True, validate=validate.OneOf([r.value for r in RoleEnum])) #con OneOf permite solamente los valores de rolenum
    dni = fields.String(required=True)
    birthdate= fields.Date(required=True) #convierte "YYYY-MM-DD" a datetime.date
    photo = fields.String(load_default=None, allow_none=True) #aca decimos que puede faltar (load_default=none) y que puede ser null (allow_none=True)
    phone=fields.String(required=True)
    nationality=fields.String(required=True)
    province=fields.String(required=True)
    is_activate = fields.Boolean(required=False, load_default=True) #por defecto es TRUE