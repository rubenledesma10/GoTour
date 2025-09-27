# from dotenv import load_dotenv 
# import os

# load_dotenv()

# user = os.getenv("MYSQL_USER")
# password = os.getenv("MYSQL_PASSWORD")
# host = os.getenv("MYSQL_HOST")
# database = os.getenv("MYSQL_DB")

# # DATABASE_CONNECTION_URI = f"mysql+pymysql://{user}:{password}@{host}/{database}"

import os
from dotenv import load_dotenv

# Carga el .env
load_dotenv()

MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "gotour")

# URI completa para SQLAlchemy
DATABASE_CONNECTION_URI = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
)
