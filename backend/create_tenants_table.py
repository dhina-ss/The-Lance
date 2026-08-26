import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    sys.exit('DATABASE_URL is not set. Add it to backend/.env')

def create_tenants_table():
    print("Connecting to Neon PostgreSQL database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        print("Creating 'tenants' table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tenants (
                id SERIAL PRIMARY KEY,
                tenant_name VARCHAR(255) NOT NULL,
                product_name VARCHAR(100) NOT NULL DEFAULT 'EMS',
                expiry_date VARCHAR(50) NOT NULL,
                plan_type VARCHAR(50) NOT NULL DEFAULT 'Enterprise',
                tenant_mail VARCHAR(255) NOT NULL,
                admin_mail VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Insert seed initial tenants if table is empty
        cur.execute("SELECT COUNT(*) FROM tenants;")
        count = cur.fetchone()[0]
        if count == 0:
            print("Seeding initial tenants into database...")
            
            initial_tenants = [
                (
                    'Coimbatore Cotton Concepts',
                    'EMS',
                    '2026-12-31',
                    'Enterprise',
                    'info@coimbatorecotton.com',
                    'admin@coimbatorecotton.com',
                    'Active'
                ),
                (
                    'Acme Innovations Ltd',
                    'EMS',
                    '2027-08-31',
                    'Pro',
                    'contact@acmeinnovations.com',
                    'admin@acmeinnovations.com',
                    'Active'
                ),
                (
                    'Global Logistics Hub',
                    'EMS',
                    '2026-10-15',
                    'Standard',
                    'support@globallogistics.com',
                    'admin@globallogistics.com',
                    'Active'
                )
            ]

            for tenant in initial_tenants:
                cur.execute("""
                    INSERT INTO tenants (tenant_name, product_name, expiry_date, plan_type, tenant_mail, admin_mail, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                """, tenant)

            print("Initial tenants seeded successfully!")

        conn.commit()

        # Print table columns summary
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'tenants'
            ORDER BY ordinal_position;
        """)
        columns = cur.fetchall()
        print("\n--- 'tenants' Table Columns ---")
        for col in columns:
            print(f" - {col[0]}: {col[1]} (Nullable: {col[2]})")

        cur.close()
        conn.close()
        print("\nTenants table setup completed successfully!")

    except Exception as e:
        print(f"Error executing database migration: {e}")
        sys.exit(1)

if __name__ == '__main__':
    create_tenants_table()
