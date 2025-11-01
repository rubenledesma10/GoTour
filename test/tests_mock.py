# test/tests_mock.py
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import importlib
import pytest
from flask import Flask
from unittest.mock import patch
from functools import wraps


class DummyUser:
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
    # 1) mockeamos el decorador ORIGINAL antes de importar el blueprint
    def fake_role_required(required_role):
        def decorator(fn):
            @wraps(fn)     # 👉 mantiene el nombre: no choca endpoints
            def wrapper(*args, **kwargs):
                dummy = DummyUser()
                # tus vistas reciben current_user como primer arg
                return fn(dummy, *args, **kwargs)
            return wrapper
        return decorator

    with patch("utils.decorators.role_required", new=fake_role_required):
        # 2) ahora sí importamos el módulo que usa ese decorador
        admin_route = importlib.import_module("routes.admin_route")

        # 3) registramos el blueprint
        app.register_blueprint(admin_route.admin_bp)
        client = app.test_client()

        # 4) probamos
        resp = client.get("/api/admin/welcome")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["message"] == "Endpoint for admin admin_fake"
