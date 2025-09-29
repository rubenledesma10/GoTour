from marshmallow import Schema, fields, validate

class TouristSiteSchema(Schema):
    id_tourist_site = fields.Str(dump_only=True)
    name = fields.Str(required=True,
        validate= validate.length(min=2, max=100, error= "Name must be between 2 and 100 characters"),
        error_messages={"required": "Name is required",}
    )
    description = fields.Str(required=True,
        validate= validate.length(min=10, error= "Description must be at least 10 characters"),
        error_messages={"required": "Description is required",}
    )
    location = fields.Str(required=True,
        validate= validate.length(min=5, max=150, error= "Location must be between 5 and 150 characters"),
        error_messages={"required": "Location is required",}
    )
    phone = fields.Str(required=True,
        validate= validate.lenght   (min=7, max=10, error="Phone number must be between 7 and 10 digits, and can include a leading +"),
        error_messages={"required": "Phone number is required",}
    )
    opening_hours = fields.Time(required=True)
    closing_hours = fields.Time(required=True)


tourist_site_schema = TouristSiteSchema()
tourist_sites_schema = TouristSiteSchema(many=True)