import json
from datetime import datetime
from app import app
from models.db import db
from models.tourist_site import TouristSite

# usuario admin
ADMIN_USER_ID = "4b10d0d8-bbf8-460d-af3c-40bdc6c25f05"


def seed_tourist_sites():
    print("🌍 Cargando sitios turísticos desde data/tourist_sites.json...")

    with app.app_context():
        with open('data/tourist_sites.json', 'r', encoding='utf-8') as file:
            sites = json.load(file)

        for site in sites:
            existing = TouristSite.query.filter_by(name=site['name']).first()
            if existing:
                print(f"⚠️ {site['name']} ya existe, se omite.")
                continue

            opening_hours = datetime.strptime(site['opening_hours'], "%H:%M").time()
            closing_hours = datetime.strptime(site['closing_hours'], "%H:%M").time()

            new_site = TouristSite(
                name=site['name'],
                description=site['description'],
                address=site['address'],
                phone=site['phone'],          
                category=site['category'],
                url=site['url'],            
                average=site['average'],     
                opening_hours=opening_hours,     
                closing_hours=closing_hours,     
                photo=site['photo'],
                id_user=ADMIN_USER_ID  
            )

            db.session.add(new_site)

        db.session.commit()
        print("✅ Sitios turísticos cargados exitosamente.")

if __name__ == "__main__":
    seed_tourist_sites()
