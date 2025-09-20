from marshmallow import Schema, fields, validate

class FeedbackSchema(Schema):
    id_feedback = fields.Int(dump_only=True)
    date_hour = fields.DateTime(dump_only=True)
    
    comment = fields.Str(
        required=False,
        validate=validate.Length(max=250)
    )
    
    qualification = fields.Int(
        required=True,
        validate=validate.Range(min=1, max=5, error="La calificación debe estar entre 1 y 5")
    )
    
    tour_site = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50, error="El nombre del sitio no puede estar vacío")
    )
    
    id_user = fields.Int(required=True)
    id_tourist_site = fields.Int(required=True)



feedback_schema = FeedbackSchema()
feedbacks_schema = FeedbackSchema(many=True)
