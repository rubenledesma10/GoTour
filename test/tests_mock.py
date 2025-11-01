# test/tests_mock.py
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import importlib #importamos el modulo desp de mockear
import pytest
from flask import Flask
from unittest.mock import patch #para reemplazar el decorador real
from functools import wraps #para que el wrapper mantenga el nombre de la función original.


class DummyUser: #usuario trucho que vamos a inyectar en la vista como si fuese un current user
    def __init__(self):
        self.id_user = "123"
        self.username = "admin_fake"
        self.role = "admin"


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config["TESTING"] = True
    return app


def test_admin_welcome_ok(app):
    def fake_role_required(required_role): #decorador falso para reempalzar el real
        def decorator(fn):
            @wraps(fn)     # mantenemos el nombre: no choca endpoints
            def wrapper(*args, **kwargs):
                dummy = DummyUser()
                # las vistas reciben current_user como primer arg
                return fn(dummy, *args, **kwargs)
            return wrapper
        return decorator

    with patch("utils.decorators.role_required", new=fake_role_required):
        #ahora importamos el módulo que usa ese decorador
        admin_route = importlib.import_module("routes.admin_route")

        # registramos el blueprint
        app.register_blueprint(admin_route.admin_bp)
        client = app.test_client()

        # probamos
        resp = client.get("/api/admin/welcome")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["message"] == "Endpoint for admin admin_fake"
