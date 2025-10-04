from marshmallow import Schema, fields, validate, pre_load

class FeedbackSchema(Schema):
    id_feedback = fields.Int(dump_only=True)
    date_hour = fields.DateTime(dump_only=True)

    comment = fields.Str(
        required=False,  # opcional en PUT
        validate=validate.Length(
            min=1,
            max=250,
            error="El comentario debe tener entre 1 y 250 caracteres"
        ),
        error_messages={
            "invalid": "El comentario debe ser texto válido"
        }
    )

    qualification = fields.Int(
        required=False,  # opcional en PUT
        validate=validate.Range(
            min=1,
            max=5,
            error="La calificación debe estar entre 1 y 5"
        ),
        error_messages={
            "invalid": "La calificación debe ser un número válido"
        }
    )

    id_tourist_site = fields.Str(
        required=False,  # opcional en PUT
        error_messages={
            "invalid": "El id del sitio turístico debe ser un string válido"
        }
    )

    # Para mostrar el nombre en las respuestas (coherente con el modelo)
    tourist_site = fields.Method("get_tourist_site", dump_only=True)

    def get_tourist_site(self, obj):
        return getattr(getattr(obj, "tourist_site", None), "name", None)

    @pre_load
    def clean_fields(self, data, **kwargs):
        """Normalizamos datos antes de validación"""
        # qualification como string → int
        if "qualification" in data and isinstance(data["qualification"], str) and data["qualification"].isdigit():
            data["qualification"] = int(data["qualification"])
        # limpiar espacios en id_tourist_site
        if "id_tourist_site" in data and isinstance(data["id_tourist_site"], str):
            data["id_tourist_site"] = data["id_tourist_site"].strip()
        return data


feedback_schema = FeedbackSchema()
feedbacks_schema = FeedbackSchema(many=True)
