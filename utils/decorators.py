import jwt 
from flask import current_app as app
from models.db import db
from models.user import User
from flask import request, jsonify
from functools import wraps
from datetime import datetime, timedelta

def role_required(role=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token=request.headers.get('Authorization')
            if not token:
                return jsonify({'message':'Token is missing'}),401
            try:
                token=token.split()[1] #Bearer <token>
                data =jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                current_user=User.query.get(data['id_user'])
                if not current_user:
                    return jsonify({'message':'User not found'}),404
                if role and current_user.role.lower() != role.lower():
                    return jsonify({'message':'Unauthorized'}),403
            except Exception as e:
                return jsonify({'message':'Token is invalid', 'error':str(e)}),401
            return f(current_user, *args,**kwargs)
        return decorated
    return decorator