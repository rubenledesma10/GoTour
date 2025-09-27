from marshmallow import Schema, fields, validate

class UserLoginSchema(Schema):
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required", "invalid": "Enter a valid email address"}
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6, error="Password must be at least 6 characters"),
        error_messages={"required": "Password is required"}
    )

user_login_schema = UserLoginSchema()