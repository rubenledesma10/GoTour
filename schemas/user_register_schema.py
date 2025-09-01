from marshmallow import Schema, fields, validate
from enums.roles_enums import RoleEnum
from datetime import date

class UserRegisterSchema(Schema):
    id_user = fields.Str(dump_only=True) #dump_only es para devolverselo al cliente, no se puede enviar en un post
    first_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    email = fields.Email(required=True)
    password = fields.Str(load_only=True, required=True, validate=validate.Length(min=6)) #load_only es solamente para recibir, nunca se devuelve
    username = fields.Str(required=True, validate=validate.Length(min=3))
    rol = fields.Str(required=True, validate=validate.OneOf([role.value for role in RoleEnum]))
    dni = fields.Str(required=True, validate=validate.Length(min=7, max=20))
    birthdate = fields.Date(required=True)  # "YYYY-MM-DD"
    photo = fields.Str(required=False, allow_none=True)
    phone = fields.Str(required=True)
    nationality = fields.Str(required=True)
    province = fields.Str(required=True)
    is_activate = fields.Bool(required=False)

    age = fields.Method("get_age", dump_only=True) #calcular la edad. Method permite crear un campo calculado que no existe en la bd

    def get_age(self, obj):
        today = date.today()
        return today.year - obj.birthdate.year - (
            (today.month, today.day) < (obj.birthdate.month, obj.birthdate.day)
        )

#instanciamos aca para no tener que estar instanciando en cada endpoint
user_schema = UserRegisterSchema() #para un solo usario
users_schema = UserRegisterSchema(many=True) #para una lista de usuarios
