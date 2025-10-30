from marshmallow import Schema, fields, validate

class TouristSiteSchema(Schema):
    id_tourist_site = fields.Str(dump_only=True)

    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100, error="Name must be between 2 and 100 characters."),
        error_messages={"required": "Name is required."}
    )

    description = fields.Str(
        required=True,
        validate=validate.Length(min=10, error="Description must be at least 10 characters."),
        error_messages={"required": "Description is required."}
    )

    address = fields.Str(
        required=True,
        validate=validate.Length(min=5, max=150, error="Address must be between 5 and 150 characters."),
        error_messages={"required": "Address is required."}
    )

    phone = fields.Str(
        required=True,
        validate=validate.Regexp(
            r'^\+?\d{7,15}$',
            error="Phone number must contain between 7 and 15 digits (optional + at start)."
        ),
        error_messages={"required": "Phone number is required."}
    )

    category = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=50, error="Category must be between 3 and 50 characters."),
        error_messages={"required": "Category is required."}
    )

    url = fields.Url(
        required=True,
        error_messages={
            "required": "Website URL is required.",
            "invalid": "Invalid URL format."
        }
    )

    average = fields.Float(
        required=True,
        validate=validate.Range(min=1, max=100, error="Average visits must be between 1 and 100."),
        error_messages={"required": "Average visits is required."}
    )

    opening_hours = fields.Time(
        required=True,
        error_messages={"required": "Opening time is required."}
    )

    closing_hours = fields.Time(
        required=True,
        error_messages={"required": "Closing time is required."}
    )

    try:
        is_activate = fields.Boolean(load_default=True)
    except TypeError:
        is_activate = fields.Boolean(missing=True)

    photo = fields.Str(dump_only=True)

tourist_site_schema = TouristSiteSchema()
tourist_sites_schema = TouristSiteSchema(many=True)
