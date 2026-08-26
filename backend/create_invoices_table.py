import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    sys.exit('DATABASE_URL is not set. Add it to backend/.env')

def create_tables():
    print("Connecting to Neon PostgreSQL database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        print("Creating 'invoices' table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS invoices (
                id VARCHAR(50) PRIMARY KEY,
                billed_to TEXT NOT NULL,
                client_name VARCHAR(255) NOT NULL,
                date VARCHAR(50) NOT NULL,
                udhayam_reg_no VARCHAR(100) DEFAULT 'UDYAM-TN-22-0125179',
                tax NUMERIC(12, 2) DEFAULT 0,
                subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
                total NUMERIC(12, 2) NOT NULL DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Pending',
                items JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        print("Creating 'invoice_items' table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS invoice_items (
                id SERIAL PRIMARY KEY,
                invoice_id VARCHAR(50) REFERENCES invoices(id) ON DELETE CASCADE,
                item_id VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
                qty INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Insert seed initial invoices if table is empty
        cur.execute("SELECT COUNT(*) FROM invoices;")
        count = cur.fetchone()[0]
        if count == 0:
            print("Seeding initial invoices into database...")
            
            # Initial Invoice 1
            inv1_id = 'TL260001'
            inv1_billed_to = """Coimbatore Cotton Concepts And
Designs Private Limited,
13, Netaji Rd, Lakshmi Mills Colony,
Pappanaickenpalayam,
Coimbatore, 641033
Tamil Nadu, India
GSTIN: 33AAFCC7855F1ZN"""
            inv1_client = 'Coimbatore Cotton Concepts And Designs Pvt Ltd'
            inv1_date = '12-08-2026'
            inv1_udhayam = 'UDYAM-TN-22-0125179'
            inv1_items = [
                {'id': '1', 'description': 'Ticket Management and Tracking', 'rate': 10000, 'qty': 1},
                {'id': '2', 'description': 'Assets Management', 'rate': 8000, 'qty': 1},
                {'id': '3', 'description': 'Pettycash Management and Tracking', 'rate': 7000, 'qty': 1}
            ]
            
            import json
            cur.execute("""
                INSERT INTO invoices (id, billed_to, client_name, date, udhayam_reg_no, tax, subtotal, total, status, items)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (inv1_id, inv1_billed_to, inv1_client, inv1_date, inv1_udhayam, 0, 25000, 25000, 'Paid', json.dumps(inv1_items)))

            for item in inv1_items:
                cur.execute("""
                    INSERT INTO invoice_items (invoice_id, item_id, description, rate, qty)
                    VALUES (%s, %s, %s, %s, %s);
                """, (inv1_id, item['id'], item['description'], item['rate'], item['qty']))

            # Initial Invoice 2
            inv2_id = 'TL260002'
            inv2_billed_to = """Global Logistics Hub Ltd,
Industrial Tech Park, Phase II,
Coimbatore, 641004"""
            inv2_client = 'Global Logistics Hub Ltd'
            inv2_date = '18-08-2026'
            inv2_udhayam = 'UDYAM-TN-22-0125179'
            inv2_items = [
                {'id': '1', 'description': 'Endpoint Management (EMS) License', 'rate': 15000, 'qty': 1},
                {'id': '2', 'description': 'Cloud Setup & DevOps Support', 'rate': 7500, 'qty': 1}
            ]
            
            cur.execute("""
                INSERT INTO invoices (id, billed_to, client_name, date, udhayam_reg_no, tax, subtotal, total, status, items)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (inv2_id, inv2_billed_to, inv2_client, inv2_date, inv2_udhayam, 0, 22500, 22500, 'Pending', json.dumps(inv2_items)))

            for item in inv2_items:
                cur.execute("""
                    INSERT INTO invoice_items (invoice_id, item_id, description, rate, qty)
                    VALUES (%s, %s, %s, %s, %s);
                """, (inv2_id, item['id'], item['description'], item['rate'], item['qty']))

            print("Initial invoices seeded successfully!")

        conn.commit()

        # Print table columns summary
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'invoices'
            ORDER BY ordinal_position;
        """)
        columns = cur.fetchall()
        print("\n--- 'invoices' Table Columns ---")
        for col in columns:
            print(f" - {col[0]}: {col[1]} (Nullable: {col[2]})")

        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'invoice_items'
            ORDER BY ordinal_position;
        """)
        item_columns = cur.fetchall()
        print("\n--- 'invoice_items' Table Columns ---")
        for col in item_columns:
            print(f" - {col[0]}: {col[1]} (Nullable: {col[2]})")

        cur.close()
        conn.close()
        print("\nDatabase migration completed successfully!")

    except Exception as e:
        print(f"Error executing database migration: {e}")
        sys.exit(1)

if __name__ == '__main__':
    create_tables()
