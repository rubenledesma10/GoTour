from models.db import db
from models.audit_log import AuditLog
from flask import current_app

def log_action(user_id, action):
    """
    Guarda un registro de auditoría inmediatamente en la base de datos.
    """
    try:
        log = AuditLog(user_id=user_id, action=action)
        db.session.add(log)
        db.session.commit()  # Commit inmediato para que se guarde en la BD
        current_app.logger.info(f"Audit log created for user {user_id}: {action}")
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to log action: {e}")
