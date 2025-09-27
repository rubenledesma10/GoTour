from marshmallow import Schema, fields, validate
from enums.roles_enums import RoleEnum
from datetime import date

class UserRegisterSchema(Schema):

    id_user = fields.Str(dump_only=True) #dump_only es para devolverselo al cliente, no se puede enviar en un post
    first_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=50, error="First name must be between 2 and 50 characters"),
        error_messages={"required": "First name is required"}
    )
    
    last_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=50, error="Last name must be between 2 and 50 characters"),
        error_messages={"required": "Last name is required"}
    )
    
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required", "invalid": "Enter a valid email address"}
    )
    
    password = fields.Str(  
        required=True,
        load_only=True,#load_only es solamente para recibir, nunca se devuelve
        validate=validate.Length(min=6, error="Password must be at least 6 characters"),
        error_messages={"required": "Password is required"}
    )
    
    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, error="Username must be at least 3 characters"),
        error_messages={"required": "Username is required"}
    )
    
    role = fields.Str(
        required=True,
        validate=validate.OneOf(
            ["admin", "tourist", "receptionist"],  # strings en minúscula
            error="Invalid role"
        ),
        error_messages={"required": "Role is required"}
    )
    
    dni = fields.Str(
        required=True,
        validate=validate.Length(min=7, max=20, error="DNI must be between 7 and 20 characters"),
        error_messages={"required": "DNI is required"}
    )
    
    birthdate = fields.Date( # "YYYY-MM-DD"
        required=True, 
        error_messages={"required": "Birthdate is required", "invalid": "Enter a valid date"}
    )
    photo = fields.Str(required=False, allow_none=True)
    phone = fields.Str(
        required=True,
        error_messages={"required": "Phone number is required"}
    )
    
    nationality = fields.Str(
        required=True,
        error_messages={"required": "Nationality is required"}
    )
    
    province = fields.Str(
        required=True,
        error_messages={"required": "Province is required"}
    )
    is_activate = fields.Bool(required=False)
    gender = fields.Str(
        required=True,
        error_messages={"required": "Gender is required"}
    )
    age = fields.Method("get_age", dump_only=True) #calcular la edad. Method permite crear un campo calculado que no existe en la bd

    def get_age(self, obj):
        today = date.today()
        return today.year - obj.birthdate.year - (
            (today.month, today.day) < (obj.birthdate.month, obj.birthdate.day)
        )

#instanciamos aca para no tener que estar instanciando en cada endpoint
user_schema = UserRegisterSchema() #para un solo usario
users_schema = UserRegisterSchema(many=True) #para una lista de usuarios