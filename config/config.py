from dotenv import load_dotenv 
import os

load_dotenv()

user = os.getenv("MYSQL_USER")
password = os.getenv("MYSQL_PASSWORD")
host = os.getenv("MYSQL_HOST")
database = os.getenv("MYSQL_DB")

DATABASE_CONNECTION_URI = f"mysql+pymysql://{user}:{password}@{host}/{database}"