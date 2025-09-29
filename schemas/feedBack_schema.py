# schemas/feedBack_schema.py
from marshmallow import Schema, fields, validate

class FeedbackSchema(Schema):
    id_feedback = fields.Int(dump_only=True)
    date_hour = fields.DateTime(dump_only=True)
    comment = fields.Str(required=False, validate=validate.Length(max=250))
    qualification = fields.Int(
        required=True,
        validate=validate.Range(min=1, max=5, error="La calificación debe estar entre 1 y 5")
    )

    tour_site = fields.Method("get_tour_site", dump_only=True)

    # 🔹 id_user ya no lo pedimos como obligatorio (lo maneja backend con current_user)
    # id_user = fields.Str(required=True)
    id_tourist_site = fields.Str(required=True)

    def get_tour_site(self, obj):
        return getattr(getattr(obj, "tourist_site", None), "name", None)

feedback_schema = FeedbackSchema()
feedbacks_schema = FeedbackSchema(many=True)
