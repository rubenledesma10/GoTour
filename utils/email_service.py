from flask_mail import Message
from config.email_config import mail
from flask import current_app

def send_welcome_email(to_email, username):
    msg = Message(
        subject="Bienvenido a GoTour 🎉",
        sender=current_app.config['MAIL_USERNAME'],
        recipients=[to_email]
    )
    msg.body = f"Hola {username}, gracias por registrarte en GoTour!"
    mail.send(msg)

def send_reset_password_email(to_email, new_password):
    msg = Message(
        subject="Recuperación de contraseña - GoTour 🔑",
        sender=current_app.config['MAIL_USERNAME'],
        recipients=[to_email]
    )
    msg.body = f"Tu nueva contraseña es: {new_password}\nPor favor cámbiala después de iniciar sesión."
    mail.send(msg)