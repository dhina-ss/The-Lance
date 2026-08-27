import os
import json
import time
import hmac
import hashlib
import base64
from flask import Flask, jsonify, request, send_from_directory, g
from flask_cors import CORS
from dotenv import load_dotenv

# Load DATABASE_URL (and any other secrets) from backend/.env locally. In
# production (Render) these come from the service's environment variables.
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Determine static folder path for frontend/dist
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend', 'dist'))

if os.path.exists(FRONTEND_DIST):
    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
else:
    app = Flask(__name__)

CORS(app)

SECRET_KEY = os.environ.get('SECRET_KEY', 'the-lance-secret-key-2026-secure-auth-token')

def generate_token(user_data):
    payload = {
        'id': user_data.get('id'),
        'email': user_data.get('email'),
        'type': user_data.get('type', 'own'),
        'exp': int(time.time()) + 86400 * 30  # 30 days expiration
    }
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def verify_token(token_str):
    if not token_str:
        return None
    try:
        if token_str.startswith('Bearer '):
            token_str = token_str[7:]
        token_str = token_str.strip()
        if '.' not in token_str:
            return None
        payload_b64, sig = token_str.rsplit('.', 1)
        expected_sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode())
        if payload.get('exp', 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None

@app.errorhandler(Exception)
def handle_error(err):
    """Ensure API routes always answer with JSON, even on an unhandled error.
    Without this, Flask returns an HTML error page for a 500, and the frontend
    fetch()/JSON.parse fails with 'Unexpected token <' instead of a usable
    message. Non-API routes keep Flask's default (HTML) behaviour."""
    from werkzeug.exceptions import HTTPException
    code = err.code if isinstance(err, HTTPException) else 500
    if request.path.startswith('/api/'):
        return jsonify({'error': type(err).__name__, 'message': str(err)}), code
    raise err


@app.before_request
def authenticate_request():
    if request.method == 'OPTIONS':
        return None

    path = request.path

    if not path.startswith('/api/'):
        return None

    PUBLIC_API_ROUTES = [
        '/api/health',
        '/api/auth/login',
        '/api/licenses/validate',
        '/api/devices/register',
        '/api/devices/unregister',
        '/api/contact/contact',
        # The installer download is gated by a valid license key (checked in the
        # handler), not the session token — the browser fetches it as a plain
        # navigation with no Authorization header.
        '/api/download-file',
    ]

    if path in PUBLIC_API_ROUTES:
        return None

    auth_header = request.headers.get('Authorization') or request.headers.get('X-Auth-Token') or ''
    device_token = request.headers.get('X-Device-Token') or ''

    if device_token:
        return None

    token_payload = verify_token(auth_header)
    if not token_payload:
        return jsonify({
            'error': 'Unauthorized. Valid authentication token required.',
            'code': 'UNAUTHORIZED'
        }), 401

    g.user = token_payload

# In-memory platform data
PRODUCTS_DATA = [
    {
        "id": "ems",
        "name": "Endpoint Management System",
        "tagline": "Unified device & policy control at scale",
        "description": "Centralize control over all your organization's endpoints — desktops, servers, and mobile devices — with real-time monitoring, policy enforcement, automated patching, and compliance reporting from a single pane of glass.",
        "iconName": "Server",
        "accentColor": "text-accent",
        "bgColor": "bg-accent/10",
        "borderColor": "border-accent/20",
        "dotColor": "bg-accent",
        "badge": "Enterprise",
        "features": [
            "Real-time device monitoring",
            "Automated patch management",
            "Policy enforcement & compliance",
            "Threat detection & response"
        ],
        "stats": [
            {"label": "Endpoints", "value": "2,400+", "iconName": "Globe"},
            {"label": "Uptime", "value": "99.98%", "iconName": "Zap"},
            {"label": "Policies Active", "value": "84", "iconName": "Shield"}
        ],
        "href": "/dashboard/products/ems"
    },
    {
        "id": "tickets",
        "name": "Ticket Management",
        "tagline": "Streamlined support & issue resolution",
        "description": "A powerful helpdesk platform built for modern teams. Manage support tickets, track SLA compliance, collaborate across departments, and deliver faster resolutions through smart routing, automation, and rich analytics.",
        "iconName": "TicketCheck",
        "accentColor": "text-emerald-500",
        "bgColor": "bg-emerald-500/10",
        "borderColor": "border-emerald-500/20",
        "dotColor": "bg-emerald-500",
        "badge": "Pro",
        "features": [
            "Intelligent ticket routing",
            "SLA tracking & alerts",
            "Multi-channel support (email, chat)",
            "Detailed analytics & reporting"
        ],
        "stats": [
            {"label": "Open Tickets", "value": "138", "iconName": "TicketCheck"},
            {"label": "Avg. Resolution", "value": "4.2h", "iconName": "Clock"},
            {"label": "Agents", "value": "32", "iconName": "Users"}
        ],
        "href": "/dashboard/products/tickets"
    }
]

DATABASE_URL = os.environ.get('DATABASE_URL', '')
if not DATABASE_URL:
    raise RuntimeError(
        'DATABASE_URL is not set. Add it to backend/.env (local) or the '
        'service environment (production).'
    )

def get_db_connection():
    import psycopg2
    return psycopg2.connect(DATABASE_URL)

def _db_host():
    """Host portion of DATABASE_URL, for diagnostics (never exposes the password)."""
    import re
    m = re.search(r'@([^/:?]+)', DATABASE_URL or '')
    return m.group(1) if m else 'unknown'


@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = "connected"
    tables_ok = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # Confirm the console tables exist in THIS database (a deploy pointed at
        # the wrong Neon DB connects fine but is missing these).
        cur.execute("SELECT to_regclass('public.devices') IS NOT NULL, "
                    "to_regclass('public.app_users') IS NOT NULL;")
        d, u = cur.fetchone()
        tables_ok = bool(d and u)
        cur.close()
        conn.close()
    except Exception as e:
        db_status = f"error: {str(e)}"

    return jsonify({
        "status": "healthy",
        "database": db_status,
        "dbHost": _db_host(),
        "consoleTablesPresent": tables_ok,
        "message": "The Lance Flask API server is running smoothly",
        "version": "1.0.0"
    })

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    employee_code = (data.get('employeeCode') or '').strip()

    # Agent activation (step 2): an employee signs in with their code/password.
    # The response shape matches what the agent expects: success/message/username/email.
    if employee_code:
        if not password:
            return jsonify({'success': False, 'message': 'Enter your employee code and password.'}), 200
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(
                'SELECT "Id", "Username", "Email", "PasswordHash" FROM app_users '
                'WHERE LOWER("EmployeeCode") = LOWER(%s) '
                '   OR LOWER("Email") = LOWER(%s) '
                '   OR LOWER("Username") = LOWER(%s) LIMIT 1;',
                (employee_code, employee_code, employee_code))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row and (row[3] or '') == password:
                return jsonify({
                    'success': True,
                    'message': 'Login successful',
                    'username': row[1],
                    'email': row[2],
                }), 200
            return jsonify({'success': False, 'message': 'Invalid employee code or password.'}), 200
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 200

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, name, email, phone, type FROM users WHERE LOWER(email) = %s AND password = %s;', (email, password))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            user_data = {
                'id': user[0],
                'name': user[1],
                'email': user[2],
                'phone': user[3],
                'type': user[4] or 'own'
            }
            token = generate_token(user_data)
            return jsonify({
                'success': True,
                'token': token,
                'user': user_data
            }), 200
        return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/licenses/validate', methods=['POST'])
def licenses_validate():
    """Agent activation (step 1): validate a tenant license key. Public."""
    data = request.get_json() or {}
    key = (data.get('licenseKey') or '').strip()
    if not key:
        return jsonify({'valid': False, 'message': 'Enter your license key.'}), 200
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, tenant_name, status, expiry_date, feature_modules FROM tenants WHERE LOWER(license_key) = LOWER(%s) LIMIT 1;', (key,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return jsonify({'valid': False, 'message': 'Invalid license key.'}), 200
        tid, tname, status, expiry, modules_raw = row
        # Tenant module "Login When Device Turn On" -> require sign-in each startup.
        # feature_modules may be a list of enabled names or a {name: bool} dict.
        if isinstance(modules_raw, (list, dict)):
            modules = modules_raw
        elif isinstance(modules_raw, str) and modules_raw:
            modules = json.loads(modules_raw)
        else:
            modules = []
        if isinstance(modules, list):
            require_login = 'Login When Device Turn On' in modules
        else:
            require_login = bool((modules or {}).get('Login When Device Turn On', False))
        if (status or '').lower() != 'active':
            return jsonify({'valid': False, 'message': f'This license is {(status or "inactive").lower()}. Contact your administrator.',
                            'tenantId': str(tid), 'tenantName': tname}), 200
        if expiry:
            import datetime
            for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y', '%Y/%m/%d', '%d/%m/%Y'):
                try:
                    d = datetime.datetime.strptime(str(expiry).strip(), fmt).date()
                    if d < datetime.date.today():
                        return jsonify({'valid': False, 'message': f'This license expired on {d.isoformat()}. Contact your administrator.',
                                        'tenantId': str(tid), 'tenantName': tname}), 200
                    break
                except ValueError:
                    continue
        return jsonify({'valid': True, 'message': 'License verified.', 'tenantId': str(tid),
                        'tenantName': tname, 'requireLoginEachStartup': require_login}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'valid': False, 'message': 'License validation is unavailable. Try again later.'}), 200


@app.route('/api/db/users', methods=['GET'])
def get_db_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, name, email, phone, type, created_at FROM users ORDER BY id ASC;')
        rows = cur.fetchall()
        cur.close()
        conn.close()

        users = [
            {
                'id': r[0],
                'name': r[1],
                'email': r[2],
                'phone': r[3],
                'type': r[4] or 'own',
                'created_at': r[5].isoformat() if r[5] else None
            }
            for r in rows
        ]
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(PRODUCTS_DATA)

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    tagline = data.get("tagline", "").strip()
    description = data.get("description", "").strip()

    if not name or not tagline:
        return jsonify({"error": "Name and tagline are required"}), 400

    product_id = data.get("id") or name.lower().replace(" ", "-")

    new_product = {
        "id": product_id,
        "name": name,
        "tagline": tagline,
        "description": description or f"{name} provides unified platform controls and monitoring.",
        "iconName": data.get("iconName", "Server"),
        "accentColor": "text-accent",
        "bgColor": "bg-accent/10",
        "borderColor": "border-accent/20",
        "dotColor": "bg-accent",
        "badge": data.get("badge", "Enterprise"),
        "features": data.get("features", ["Automated provisioning", "Role-based access", "Telemetry"]),
        "stats": [
            {"label": "Active Tenants", "value": "1", "iconName": "Globe"},
            {"label": "Uptime", "value": "99.99%", "iconName": "Zap"},
            {"label": "Policies", "value": "12", "iconName": "Shield"}
        ],
        "href": f"/dashboard/tenants/{product_id}"
    }

    PRODUCTS_DATA.insert(0, new_product)
    return jsonify(new_product), 201

# ── INVOICES API ENDPOINTS (NEON DB) ──
@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    try:
        import json
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, billed_to, client_name, date, udhayam_reg_no, tax, subtotal, total, status, items FROM invoices ORDER BY created_at DESC;")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        invoices_list = []
        for r in rows:
            invoices_list.append({
                'id': r[0],
                'billedTo': r[1],
                'clientName': r[2],
                'date': r[3],
                'udhayamRegNo': r[4],
                'tax': float(r[5] or 0),
                'subtotal': float(r[6] or 0),
                'total': float(r[7] or 0),
                'status': r[8] or 'Pending',
                'items': r[9] if isinstance(r[9], list) else (json.loads(r[9]) if r[9] else [])
            })
        return jsonify(invoices_list), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    try:
        import json
        data = request.get_json() or {}
        inv_id = data.get('id')
        billed_to = data.get('billedTo', '')
        client_name = data.get('clientName', '')
        date_str = data.get('date', '')
        udhayam_reg_no = data.get('udhayamRegNo', 'UDYAM-TN-22-0125179')
        tax = float(data.get('tax', 0))
        subtotal = float(data.get('subtotal', 0))
        total = float(data.get('total', 0))
        status = data.get('status', 'Pending')
        items = data.get('items', [])

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO invoices (id, billed_to, client_name, date, udhayam_reg_no, tax, subtotal, total, status, items)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                billed_to = EXCLUDED.billed_to,
                client_name = EXCLUDED.client_name,
                date = EXCLUDED.date,
                udhayam_reg_no = EXCLUDED.udhayam_reg_no,
                tax = EXCLUDED.tax,
                subtotal = EXCLUDED.subtotal,
                total = EXCLUDED.total,
                status = EXCLUDED.status,
                items = EXCLUDED.items,
                updated_at = CURRENT_TIMESTAMP;
        """, (inv_id, billed_to, client_name, date_str, udhayam_reg_no, tax, subtotal, total, status, json.dumps(items)))

        cur.execute("DELETE FROM invoice_items WHERE invoice_id = %s;", (inv_id,))
        for item in items:
            cur.execute("""
                INSERT INTO invoice_items (invoice_id, item_id, description, rate, qty)
                VALUES (%s, %s, %s, %s, %s);
            """, (inv_id, str(item.get('id', '')), item.get('description', ''), float(item.get('rate', 0)), int(item.get('qty', 1))))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'success': True, 'invoice': data}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices/<invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    try:
        import json
        data = request.get_json() or {}
        billed_to = data.get('billedTo', '')
        client_name = data.get('clientName', '')
        date_str = data.get('date', '')
        udhayam_reg_no = data.get('udhayamRegNo', 'UDYAM-TN-22-0125179')
        tax = float(data.get('tax', 0))
        subtotal = float(data.get('subtotal', 0))
        total = float(data.get('total', 0))
        status = data.get('status', 'Pending')
        items = data.get('items', [])

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE invoices SET
                billed_to = %s,
                client_name = %s,
                date = %s,
                udhayam_reg_no = %s,
                tax = %s,
                subtotal = %s,
                total = %s,
                status = %s,
                items = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s;
        """, (billed_to, client_name, date_str, udhayam_reg_no, tax, subtotal, total, status, json.dumps(items), invoice_id))

        cur.execute("DELETE FROM invoice_items WHERE invoice_id = %s;", (invoice_id,))
        for item in items:
            cur.execute("""
                INSERT INTO invoice_items (invoice_id, item_id, description, rate, qty)
                VALUES (%s, %s, %s, %s, %s);
            """, (invoice_id, str(item.get('id', '')), item.get('description', ''), float(item.get('rate', 0)), int(item.get('qty', 1))))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'success': True, 'invoice': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices/<invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM invoices WHERE id = %s;", (invoice_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': f'Invoice {invoice_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── TENANTS API ENDPOINTS (NEON DB) ──
DEFAULT_EMS_MODULES = {
    'USB Blocking': True,
    'Installed Applications': True,
    'Used Applications': True,
    'Website Blocking': True,
    'Install / Uninstall Apps': True,
    'Location Tracking': True,
    'Login When Device Turn On': True
}

@app.route('/api/tenants', methods=['GET'])
def get_tenants():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, tenant_name, product_name, expiry_date, plan_type, subscription_type, has_trial, tenant_mail, admin_mail, status, address, mobile_number, max_users, feature_modules, license_key, admin_name FROM tenants ORDER BY id DESC;")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        tenants_list = []
        for r in rows:
            raw_modules = r[13]
            feature_modules = raw_modules if isinstance(raw_modules, (list, dict)) else (json.loads(raw_modules) if isinstance(raw_modules, str) else None)
            if feature_modules is None:
                feature_modules = DEFAULT_EMS_MODULES

            tenants_list.append({
                'id': r[0],
                'tenantName': r[1],
                'productName': r[2],
                'expiryDate': r[3],
                'planType': r[4],
                'subscriptionType': r[5] or 'Annual Recurring',
                'hasTrial': r[6] or 'None',
                'tenantMail': r[7],
                'adminMail': r[8],
                'status': r[9] or 'Active',
                'address': r[10] or '',
                'mobileNumber': r[11] or '',
                'maxUsers': r[12] if r[12] is not None else 100,
                'featureModules': feature_modules,
                'licenseKey': r[14] or '',
                'adminName': r[15] or ''
            })
        return jsonify(tenants_list), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenants/<tenant_id>', methods=['GET'])
def get_single_tenant(tenant_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        t_id_str = str(tenant_id).lower()
        cur.execute("""
            SELECT id, tenant_name, product_name, expiry_date, plan_type, subscription_type, has_trial, tenant_mail, admin_mail, status, address, mobile_number, max_users, feature_modules, license_key, admin_name
            FROM tenants
            WHERE id::text = %s
               OR LOWER(tenant_name) = %s 
               OR REPLACE(LOWER(tenant_name), ' ', '-') = %s 
               OR REPLACE(LOWER(tenant_name), '-', ' ') = %s;
        """, (t_id_str, t_id_str, t_id_str, t_id_str))
        
        r = cur.fetchone()
        cur.close()
        conn.close()

        if r:
            raw_modules = r[13]
            feature_modules = raw_modules if isinstance(raw_modules, (list, dict)) else (json.loads(raw_modules) if isinstance(raw_modules, str) else None)
            if feature_modules is None:
                feature_modules = DEFAULT_EMS_MODULES

            return jsonify({
                'id': r[0],
                'tenantName': r[1],
                'productName': r[2],
                'expiryDate': r[3],
                'planType': r[4],
                'subscriptionType': r[5] or 'Annual Recurring',
                'hasTrial': r[6] or 'None',
                'tenantMail': r[7],
                'adminMail': r[8],
                'status': r[9] or 'Active',
                'address': r[10] or '',
                'mobileNumber': r[11] or '',
                'maxUsers': r[12] if r[12] is not None else 100,
                'featureModules': feature_modules,
                'licenseKey': r[14] or '',
                'adminName': r[15] or ''
            }), 200
        return jsonify({'error': 'Tenant not found'}), 404
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenants', methods=['POST'])
def create_tenant():
    try:
        data = request.json or {}
        tenant_name = data.get('tenantName', '')
        product_name = data.get('productName', 'EMS')
        expiry_date = data.get('expiryDate', '')
        plan_type = data.get('planType', 'Enterprise')
        subscription_type = data.get('subscriptionType', 'Annual Recurring')
        has_trial = data.get('hasTrial', 'None')
        tenant_mail = data.get('tenantMail', '')
        admin_mail = data.get('adminMail', '')
        admin_name = data.get('adminName', '')
        status = data.get('status', 'Active')
        address = data.get('address', '')
        mobile_number = data.get('mobileNumber', '')
        max_users = int(data.get('maxUsers', 100))
        license_key = data.get('licenseKey', '')
        feature_modules = data.get('featureModules', DEFAULT_EMS_MODULES)
        modules_json = json.dumps(feature_modules)

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO tenants (tenant_name, product_name, expiry_date, plan_type, subscription_type, has_trial, tenant_mail, admin_mail, admin_name, status, address, mobile_number, max_users, feature_modules, license_key)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (tenant_name, product_name, expiry_date, plan_type, subscription_type, has_trial, tenant_mail, admin_mail, admin_name, status, address, mobile_number, max_users, modules_json, license_key))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        data['id'] = new_id
        return jsonify({'success': True, 'tenant': data}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenants/<tenant_id>', methods=['PUT'])
def update_tenant(tenant_id):
    try:
        data = request.json or {}
        tenant_name = data.get('tenantName', '')
        product_name = data.get('productName', 'EMS')
        expiry_date = data.get('expiryDate', '')
        plan_type = data.get('planType', 'Enterprise')
        subscription_type = data.get('subscriptionType', 'Annual Recurring')
        has_trial = data.get('hasTrial', 'None')
        tenant_mail = data.get('tenantMail', '')
        admin_mail = data.get('adminMail', '')
        admin_name = data.get('adminName', '')
        status = data.get('status', 'Active')
        address = data.get('address', '')
        mobile_number = data.get('mobileNumber', '')
        max_users = int(data.get('maxUsers', 100))

        t_id_str = str(tenant_id).lower()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE tenants SET
                tenant_name = %s,
                product_name = %s,
                expiry_date = %s,
                plan_type = %s,
                subscription_type = %s,
                has_trial = %s,
                tenant_mail = %s,
                admin_mail = %s,
                admin_name = %s,
                status = %s,
                address = %s,
                mobile_number = %s,
                max_users = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id::text = %s
               OR LOWER(tenant_name) = %s
               OR REPLACE(LOWER(tenant_name), ' ', '-') = %s
               OR REPLACE(LOWER(tenant_name), '-', ' ') = %s;
        """, (tenant_name, product_name, expiry_date, plan_type, subscription_type, has_trial, tenant_mail, admin_mail, admin_name, status, address, mobile_number, max_users, t_id_str, t_id_str, t_id_str, t_id_str))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'success': True, 'tenant': data}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenants/<tenant_id>/modules', methods=['PUT'])
def update_tenant_modules(tenant_id):
    try:
        data = request.json or {}
        feature_modules = data.get('featureModules', {})
        modules_json = json.dumps(feature_modules)

        t_id_str = str(tenant_id).lower()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE tenants SET feature_modules = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id::text = %s 
               OR LOWER(tenant_name) = %s 
               OR REPLACE(LOWER(tenant_name), ' ', '-') = %s 
               OR REPLACE(LOWER(tenant_name), '-', ' ') = %s;
        """, (modules_json, t_id_str, t_id_str, t_id_str, t_id_str))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'success': True, 'featureModules': feature_modules}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenants/<int:tenant_id>', methods=['DELETE'])
def delete_tenant(tenant_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM tenants WHERE id = %s;", (tenant_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': f'Tenant {tenant_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def to_iso(val):
    if val is None:
        return None
    if hasattr(val, 'isoformat'):
        return val.isoformat()
    return str(val)


def reverse_geocode(lat, lon):
    """lat/lon -> (city, region, country) via OpenStreetMap Nominatim."""
    import urllib.request
    try:
        url = (f'https://nominatim.openstreetmap.org/reverse?format=json'
               f'&lat={lat}&lon={lon}&zoom=10&addressdetails=1')
        req = urllib.request.Request(url, headers={'User-Agent': 'TheLanceEndpoint/1.0'})
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode())
        addr = data.get('address', {}) or {}
        city = addr.get('city') or addr.get('town') or addr.get('village') or addr.get('county')
        return city, addr.get('state'), addr.get('country')
    except Exception as e:
        print(f'reverse_geocode failed: {e}')
        return None, None, None


def client_public_ip():
    """The caller's public IP: leftmost X-Forwarded-For, else remote_addr.
    Returns None for private/loopback addresses (e.g. local testing)."""
    import ipaddress
    fwd = request.headers.get('X-Forwarded-For', '')
    candidate = (fwd.split(',')[0].strip() if fwd else '') or (request.remote_addr or '')
    try:
        ip = ipaddress.ip_address(candidate)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            return None
        return candidate
    except ValueError:
        return None


def compute_status(last_heartbeat, suspended_at):
    """Online if a heartbeat arrived < 3 min ago; Sleep if suspended; else Offline."""
    import datetime
    if last_heartbeat is not None:
        try:
            age = (datetime.datetime.now(datetime.timezone.utc) - last_heartbeat).total_seconds()
            if age < 180:
                return 'Online'
        except Exception:
            pass
    if suspended_at is not None:
        return 'Sleep'
    return 'Offline'

# ── DEVICES API ENDPOINTS (NEON DB) ──
@app.route('/api/devices/register', methods=['POST'])
def register_device():
    """
    Agent registration: upserts the device from its inventory and links it to
    the activating employee (app_users.DeviceId) so the console shows the user
    as connected. First call is anonymous (no token yet) -> public route.
    Returns {success, message, deviceId, token} as the agent expects.
    """
    import secrets
    data = request.get_json() or {}
    device_id = (data.get('deviceId') or '').strip()
    if not device_id:
        return jsonify({'success': False, 'message': 'deviceId is required'}), 400
    activated_by = (data.get('activatedBy') or '').strip()
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Resolve the activating employee (by code / email / username).
        user_id = None
        if activated_by:
            cur.execute(
                'SELECT "Id" FROM app_users WHERE LOWER("EmployeeCode") = LOWER(%s) '
                '   OR LOWER("Email") = LOWER(%s) OR LOWER("Username") = LOWER(%s) LIMIT 1;',
                (activated_by, activated_by, activated_by))
            r = cur.fetchone()
            if r:
                user_id = r[0]

        cur.execute("""
            INSERT INTO devices ("DeviceId","DeviceName","SerialNumber","Manufacturer","Model",
                "Processor","RamSize","StorageSize","OSVersion","OSBuildNumber","IPAddress",
                "MACAddress","Username","LastBootTime","CreatedDate","UpdatedDate","LastSeen",
                "ActivatedByUserId","ActivatedAt")
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,%s,CURRENT_TIMESTAMP)
            ON CONFLICT ("DeviceId") DO UPDATE SET
                "DeviceName"=EXCLUDED."DeviceName","SerialNumber"=EXCLUDED."SerialNumber",
                "Manufacturer"=EXCLUDED."Manufacturer","Model"=EXCLUDED."Model",
                "Processor"=EXCLUDED."Processor","RamSize"=EXCLUDED."RamSize",
                "StorageSize"=EXCLUDED."StorageSize","OSVersion"=EXCLUDED."OSVersion",
                "OSBuildNumber"=EXCLUDED."OSBuildNumber","IPAddress"=EXCLUDED."IPAddress",
                "MACAddress"=EXCLUDED."MACAddress","Username"=EXCLUDED."Username",
                "LastBootTime"=EXCLUDED."LastBootTime","UpdatedDate"=CURRENT_TIMESTAMP,
                "LastSeen"=CURRENT_TIMESTAMP,
                "ActivatedByUserId"=COALESCE(EXCLUDED."ActivatedByUserId", devices."ActivatedByUserId"),
                "ActivatedAt"=COALESCE(devices."ActivatedAt", CURRENT_TIMESTAMP);
        """, (device_id, data.get('deviceName'), data.get('serialNumber'), data.get('manufacturer'),
              data.get('model'), data.get('processor'), data.get('ramSize'), data.get('storageSize'),
              data.get('osVersion'), data.get('osBuildNumber'), data.get('ipAddress'),
              data.get('macAddress'), data.get('username'), data.get('lastBootTime'),
              str(user_id) if user_id is not None else None))

        # Link the employee to this device -> the console shows "Connected".
        if user_id is not None:
            cur.execute('UPDATE app_users SET "DeviceId" = %s WHERE "Id" = %s;', (device_id, user_id))

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Device registered successfully',
                        'deviceId': device_id, 'token': secrets.token_hex(32)}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/devices/unregister', methods=['POST'])
def unregister_device():
    """
    Called by the agent's uninstaller: removes this device's record and all its
    reported data, and unlinks the user (so the console shows it disconnected).
    Public - identified by the X-Device-Id header.
    """
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    if not device_id:
        return jsonify({'error': 'device id required'}), 400
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        for t in ('device_metrics', 'installed_applications', 'app_usage_records',
                  'network_usage_records', 'work_session_records', 'device_threats',
                  'blocked_websites', 'device_commands'):
            cur.execute('DELETE FROM %s WHERE device_id = %%s;' % t, (device_id,))
        cur.execute('UPDATE app_users SET "DeviceId" = NULL WHERE "DeviceId" = %s;', (device_id,))
        cur.execute('DELETE FROM devices WHERE "DeviceId" = %s;', (device_id,))
        removed = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'removed': removed}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/heartbeat', methods=['POST'])
def device_heartbeat():
    """
    Agent heartbeat: refresh LastSeen, store the latest live metrics, accumulate
    today's network usage, auto-expire USB blocking, and return the device's
    live policies (USB / store gating / login policy / blocked websites).
    """
    import datetime
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    data = request.get_json() or {}
    metrics = data.get('metrics') or {}
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        public_ip = client_public_ip()
        cur.execute(
            'UPDATE devices SET "LastSeen"=CURRENT_TIMESTAMP, "LastHeartbeatTime"=CURRENT_TIMESTAMP, '
            '"IPAddress"=COALESCE(%s,"IPAddress"), "Username"=COALESCE(%s,"Username"), '
            '"PublicIPAddress"=COALESCE(%s,"PublicIPAddress"), "SuspendedAt"=NULL '
            'WHERE "DeviceId"=%s;',
            (data.get('ipAddress'), data.get('username'), public_ip, device_id))

        # Auto-expire timed USB blocking.
        cur.execute('UPDATE devices SET "UsbBlockingEnabled"=false, "UsbBlockingUntil"=NULL '
                    'WHERE "DeviceId"=%s AND "UsbBlockingEnabled"=true AND "UsbBlockingUntil" IS NOT NULL '
                    'AND "UsbBlockingUntil" <= CURRENT_TIMESTAMP;', (device_id,))

        # Latest live metrics (one row per device).
        if metrics:
            cur.execute("""
                INSERT INTO device_metrics (device_id, collected_at, cpu_percent, mem_used_mb, mem_total_mb,
                    mem_percent, disk_used_gb, disk_total_gb, disk_percent, uptime_seconds, has_battery,
                    battery_percent, battery_charging, net_sent_kbps, net_recv_kbps, agent_version)
                VALUES (%s, CURRENT_TIMESTAMP, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (device_id) DO UPDATE SET collected_at=CURRENT_TIMESTAMP,
                    cpu_percent=EXCLUDED.cpu_percent, mem_used_mb=EXCLUDED.mem_used_mb,
                    mem_total_mb=EXCLUDED.mem_total_mb, mem_percent=EXCLUDED.mem_percent,
                    disk_used_gb=EXCLUDED.disk_used_gb, disk_total_gb=EXCLUDED.disk_total_gb,
                    disk_percent=EXCLUDED.disk_percent, uptime_seconds=EXCLUDED.uptime_seconds,
                    has_battery=EXCLUDED.has_battery, battery_percent=EXCLUDED.battery_percent,
                    battery_charging=EXCLUDED.battery_charging, net_sent_kbps=EXCLUDED.net_sent_kbps,
                    net_recv_kbps=EXCLUDED.net_recv_kbps, agent_version=EXCLUDED.agent_version;
            """, (device_id, metrics.get('cpuUsagePercent'), metrics.get('memoryUsedMb'),
                  metrics.get('memoryTotalMb'), metrics.get('memoryUsagePercent'), metrics.get('diskUsedGb'),
                  metrics.get('diskTotalGb'), metrics.get('diskUsagePercent'), metrics.get('uptimeSeconds'),
                  metrics.get('hasBattery'), metrics.get('batteryPercent'), metrics.get('batteryCharging'),
                  metrics.get('networkSentKbps'), metrics.get('networkReceivedKbps'), data.get('agentVersion')))

            sent = int(metrics.get('networkBytesSentDelta') or 0)
            recv = int(metrics.get('networkBytesReceivedDelta') or 0)
            if sent > 0 or recv > 0:
                cur.execute("""
                    INSERT INTO network_usage_records (device_id, usage_date, bytes_sent, bytes_received, last_updated)
                    VALUES (%s, CURRENT_DATE, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (device_id, usage_date) DO UPDATE SET
                        bytes_sent = network_usage_records.bytes_sent + EXCLUDED.bytes_sent,
                        bytes_received = network_usage_records.bytes_received + EXCLUDED.bytes_received,
                        last_updated = CURRENT_TIMESTAMP;
                """, (device_id, sent, recv))

        cur.execute('SELECT "UsbBlockingEnabled","StoreGatingEnabled","RequireLoginEachStartup" FROM devices WHERE "DeviceId"=%s;', (device_id,))
        row = cur.fetchone()
        cur.execute('SELECT domain FROM blocked_websites WHERE device_id=%s;', (device_id,))
        blocked = sorted({d for d in (normalize_domain(r[0]) for r in cur.fetchall()) if d})
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({
            'success': True,
            'message': 'Heartbeat received',
            'serverTime': datetime.datetime.utcnow().isoformat() + 'Z',
            'usbBlockingEnabled': bool(row[0]) if row else False,
            'storeGatingEnabled': bool(row[1]) if row else False,
            'requireLoginEachStartup': bool(row[2]) if row else False,
            'blockedWebsites': blocked
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/devices/security-status', methods=['POST'])
def report_security_status():
    """Agent report: Microsoft Defender status + threat history (replace-all)."""
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    if not device_id:
        return jsonify({'error': 'device id required'}), 400
    data = request.get_json() or {}
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE devices SET "DefenderRealtimeProtectionEnabled"=%s, "DefenderAntivirusEnabled"=%s,
                "DefenderLastQuickScan"=%s, "DefenderLastFullScan"=%s, "DefenderSignatureVersion"=%s,
                "DefenderSignatureAgeDays"=%s, "DefenderEngineVersion"=%s, "SecurityStatusUpdatedAt"=CURRENT_TIMESTAMP
            WHERE "DeviceId"=%s;
        """, (data.get('realtimeProtectionEnabled'), data.get('antivirusEnabled'), data.get('lastQuickScan'),
              data.get('lastFullScan'), data.get('signatureVersion'), data.get('signatureAgeDays'),
              data.get('engineVersion'), device_id))
        cur.execute('DELETE FROM device_threats WHERE device_id=%s;', (device_id,))
        for t in (data.get('threats') or []):
            name = (t.get('name') or '').strip()
            if not name:
                continue
            cur.execute('INSERT INTO device_threats (device_id, name, severity, detected_at, remediated, resource) '
                        'VALUES (%s,%s,%s,%s,%s,%s);',
                        (device_id, name[:400], t.get('severity'), t.get('detectedAt'),
                         bool(t.get('remediated')), (t.get('resource') or None)))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/work-time', methods=['POST'])
def report_work_time():
    """Agent report: increment per-day worked-seconds by the reported deltas."""
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    if not device_id:
        return jsonify({'error': 'device id required'}), 400
    data = request.get_json() or {}
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        for s in (data.get('sessions') or []):
            work_date = s.get('workDate')
            delta = int(s.get('secondsDelta') or 0)
            if not work_date or delta <= 0:
                continue
            cur.execute("""
                INSERT INTO work_session_records (device_id, work_date, worked_seconds, last_updated)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (device_id, work_date) DO UPDATE SET
                    worked_seconds = work_session_records.worked_seconds + EXCLUDED.worked_seconds,
                    last_updated = CURRENT_TIMESTAMP;
            """, (device_id, work_date, delta))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/power-state', methods=['POST'])
def report_power_state():
    """Agent beacon: mark the device as suspended (drives the Sleep status)."""
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    data = request.get_json() or {}
    suspended = bool(data.get('suspended'))
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        if suspended:
            cur.execute('UPDATE devices SET "SuspendedAt"=CURRENT_TIMESTAMP WHERE "DeviceId"=%s;', (device_id,))
        else:
            cur.execute('UPDATE devices SET "SuspendedAt"=NULL WHERE "DeviceId"=%s;', (device_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/location', methods=['POST'])
def report_location():
    """Agent report: precise GPS fix -> device GPS columns + reverse geocode."""
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    data = request.get_json() or {}
    lat, lon = data.get('latitude'), data.get('longitude')
    city, region, country = (reverse_geocode(lat, lon) if lat is not None and lon is not None else (None, None, None))
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE devices SET "GpsLatitude"=%s, "GpsLongitude"=%s, "GpsAccuracyMeters"=%s, '
                    '"GpsUpdatedAt"=CURRENT_TIMESTAMP, '
                    '"GpsCity"=COALESCE(%s,"GpsCity"), "GpsCountry"=COALESCE(%s,"GpsCountry"), '
                    '"LocationRegion"=COALESCE(%s,"LocationRegion") WHERE "DeviceId"=%s;',
                    (lat, lon, data.get('accuracyMeters'), city, country, region, device_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/commands/pending', methods=['GET'])
def get_pending_commands():
    """Agent poll: pending commands for the calling device; marked Dispatched."""
    import psycopg2.extras
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT c.id, c.type, c.target_app_name, c.target_app_version, c.target_is_store_app,
                   c.package_id, p.file_name AS package_file_name, p.silent_args
            FROM device_commands c LEFT JOIN installer_packages p ON c.package_id = p.id
            WHERE c.device_id=%s AND c.status='Pending' ORDER BY c.created_at;
        """, (device_id,))
        rows = cur.fetchall()
        ids = [r['id'] for r in rows]
        if ids:
            cur.execute('UPDATE device_commands SET status=%s, updated_at=CURRENT_TIMESTAMP WHERE id::text = ANY(%s);',
                        ('Dispatched', [str(i) for i in ids]))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify([{
            'id': str(r['id']), 'type': r['type'], 'targetAppName': r['target_app_name'],
            'targetAppVersion': r['target_app_version'], 'targetIsStoreApp': bool(r['target_is_store_app']),
            'packageId': str(r['package_id']) if r['package_id'] else None,
            'packageFileName': r['package_file_name'], 'silentArgs': r['silent_args']
        } for r in rows]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/commands/<command_id>/result', methods=['POST'])
def report_command_result(command_id):
    """Agent report: outcome of a dispatched command."""
    data = request.get_json() or {}
    success = bool(data.get('success'))
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE device_commands SET status=%s, result_code=%s, result_message=%s, '
                    "updated_at=CURRENT_TIMESTAMP WHERE id::text=%s AND status <> 'Cancelled';",
                    ('Succeeded' if success else 'Failed', data.get('resultCode'),
                     (data.get('message') or '')[:2000], str(command_id)))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/commands/<command_id>/status', methods=['GET'])
def get_command_status(command_id):
    """Agent poll: current status of a single command it is executing, so it can
    abort promptly when the console cancels it (device-auth passthrough)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT status FROM device_commands WHERE id::text=%s;', (str(command_id),))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return jsonify({'status': 'NotFound'}), 404
        return jsonify({'status': row[0]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/commands/<command_id>/cancel', methods=['POST'])
def cancel_device_command(command_id):
    """Console: cancel a queued install/uninstall that has not finished yet.

    Only commands still in flight (Pending/Dispatched) can be cancelled. A
    Pending command is dropped before the agent ever polls it; a Dispatched one
    is marked Cancelled so it disappears from the queue, though the agent may
    already be mid-execution (best-effort)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE device_commands SET status='Cancelled', updated_at=CURRENT_TIMESTAMP "
                    "WHERE id::text=%s AND status IN ('Pending','Dispatched');", (str(command_id),))
        changed = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()
        if changed == 0:
            return jsonify({'success': False, 'message': 'Command already finished or not found.'}), 409
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/installers', methods=['GET'])
def get_installer_info():
    """Super-admin: metadata for the current agent installer (no bytes)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT to_regclass('public.app_installers');")
        if cur.fetchone()[0] is None:
            cur.close(); conn.close()
            return jsonify({'installer': None}), 200
        cur.execute('SELECT file_name, version, size_bytes, uploaded_at '
                    'FROM app_installers ORDER BY uploaded_at DESC LIMIT 1;')
        r = cur.fetchone()
        cur.close(); conn.close()
        if not r:
            return jsonify({'installer': None}), 200
        return jsonify({'installer': {
            'fileName': r[0], 'version': r[1], 'sizeBytes': r[2], 'uploadedAt': to_iso(r[3])
        }}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/installers', methods=['POST'])
def upload_installer():
    """Super-admin: upload a new agent installer (.exe). Replaces the current
    one so tenants always download the latest build."""
    import psycopg2
    f = request.files.get('file')
    if not f:
        return jsonify({'message': 'A file is required.'}), 400
    filename = (f.filename or '').strip()
    if not filename.lower().endswith('.exe'):
        return jsonify({'message': 'The installer must be a .exe file.'}), 400
    content = f.read()
    if not content:
        return jsonify({'message': 'The uploaded file is empty.'}), 400
    version = (request.form.get('version') or '').strip() or None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''CREATE TABLE IF NOT EXISTS app_installers (
          id serial PRIMARY KEY, file_name varchar(300), version varchar(50),
          content bytea, size_bytes integer,
          uploaded_at timestamptz DEFAULT CURRENT_TIMESTAMP);''')
        cur.execute('DELETE FROM app_installers;')  # keep only the latest
        cur.execute('INSERT INTO app_installers (file_name, version, content, size_bytes) '
                    'VALUES (%s,%s,%s,%s);',
                    ('TheLanceEMSSetup.exe', version, psycopg2.Binary(content), len(content)))
        conn.commit()
        cur.close(); conn.close()
        return jsonify({'success': True, 'fileName': 'TheLanceEMSSetup.exe',
                        'version': version, 'sizeBytes': len(content)}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500


@app.route('/api/packages/<package_id>/content', methods=['GET'])
def get_package_content(package_id):
    """Agent download: raw installer bytes for an Install/Update command."""
    from flask import send_file
    import io
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT file_name, content FROM installer_packages WHERE id::text=%s;', (str(package_id),))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row or row[1] is None:
            return jsonify({'error': 'Package not found'}), 404
        return send_file(io.BytesIO(bytes(row[1])), as_attachment=True,
                         download_name=row[0] or 'package.bin', mimetype='application/octet-stream')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/packages', methods=['GET'])
def list_packages():
    import psycopg2.extras
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute('SELECT id, file_name, display_name, silent_args, created_at FROM installer_packages ORDER BY created_at DESC;')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([{'id': str(r['id']), 'fileName': r['file_name'], 'displayName': r['display_name'],
                         'silentArgs': r['silent_args'], 'createdAt': to_iso(r['created_at'])} for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/packages', methods=['POST'])
def upload_package():
    import hashlib
    import psycopg2
    f = request.files.get('file')
    if not f:
        return jsonify({'message': 'A file is required'}), 400
    content = f.read()
    display_name = (request.form.get('displayName') or f.filename or 'package').strip()
    silent_args = (request.form.get('silentArgs') or '').strip() or None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO installer_packages (file_name, display_name, silent_args, sha256, content) '
                    'VALUES (%s,%s,%s,%s,%s) RETURNING id;',
                    (f.filename or 'package', display_name, silent_args,
                     hashlib.sha256(content).hexdigest(), psycopg2.Binary(content)))
        pid = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'id': str(pid), 'fileName': f.filename, 'displayName': display_name}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500


@app.route('/api/devices', methods=['GET'])
def get_devices():
    try:
        import psycopg2.extras
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT d.*, 
                   u."Username" AS "ActivatedByName", 
                   u."Email" AS "ActivatedByEmail", 
                   u."EmployeeCode" AS "ActivatedByEmployeeCode"
            FROM devices d
            LEFT JOIN app_users u ON d."DeviceId" = u."DeviceId"
            ORDER BY d."Id" ASC;
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        devices = []
        for r in rows:
            devices.append({
                'id': str(r['Id']),
                'deviceId': r.get('DeviceId'),
                'deviceName': r.get('DeviceName'),
                'serialNumber': r.get('SerialNumber'),
                'manufacturer': r.get('Manufacturer'),
                'model': r.get('Model'),
                'processor': r.get('Processor'),
                'ramSize': r.get('RamSize'),
                'storageSize': r.get('StorageSize'),
                'osVersion': r.get('OSVersion'),
                'osBuildNumber': r.get('OSBuildNumber'),
                'ipAddress': r.get('IPAddress'),
                'macAddress': r.get('MACAddress'),
                'username': r.get('Username'),
                'activatedByName': r.get('ActivatedByName') or r.get('Username'),
                'activatedByEmail': r.get('ActivatedByEmail'),
                'activatedByEmployeeCode': r.get('ActivatedByEmployeeCode'),
                'lastBootTime': to_iso(r.get('LastBootTime')),
                'createdDate': to_iso(r.get('CreatedDate')),
                'updatedDate': to_iso(r.get('UpdatedDate')),
                'lastSeen': to_iso(r.get('LastSeen')),
                'lastHeartbeatTime': to_iso(r.get('LastHeartbeatTime')),
                'usbBlockingEnabled': bool(r.get('UsbBlockingEnabled')),
                'usbBlockingUntil': to_iso(r.get('UsbBlockingUntil')),
                'storeGatingEnabled': bool(r.get('StoreGatingEnabled')),
                'requireLoginEachStartup': bool(r.get('RequireLoginEachStartup')),
                'activatedAt': to_iso(r.get('ActivatedAt')),
                'activatedByUserId': r.get('ActivatedByUserId'),
                'suspendedAt': to_iso(r.get('SuspendedAt')),
                # Effective location: prefer a GPS fix, else IP.
                'locationSource': 'GPS' if r.get('GpsLatitude') is not None else ('IP' if r.get('Latitude') is not None else None),
                'latitude': r.get('GpsLatitude') if r.get('GpsLatitude') is not None else r.get('Latitude'),
                'longitude': r.get('GpsLongitude') if r.get('GpsLatitude') is not None else r.get('Longitude'),
                'locationCity': r.get('GpsCity') or r.get('LocationCity'),
                'locationCountry': r.get('GpsCountry') or r.get('LocationCountry'),
                'locationRegion': r.get('LocationRegion'),
                'locationUpdatedAt': to_iso(r.get('GpsUpdatedAt') or r.get('LocationUpdatedAt')),
                'publicIPAddress': r.get('PublicIPAddress'),
                'gpsAccuracyMeters': r.get('GpsAccuracyMeters'),
                'gpsCity': r.get('GpsCity'),
                'gpsCountry': r.get('GpsCountry'),
                'gpsLatitude': r.get('GpsLatitude'),
                'gpsLongitude': r.get('GpsLongitude'),
                'gpsUpdatedAt': to_iso(r.get('GpsUpdatedAt')),
                'defenderAntivirusEnabled': bool(r.get('DefenderAntivirusEnabled')),
                'defenderEngineVersion': r.get('DefenderEngineVersion'),
                'defenderLastFullScan': to_iso(r.get('DefenderLastFullScan')),
                'defenderLastQuickScan': to_iso(r.get('DefenderLastQuickScan')),
                'defenderRealtimeProtectionEnabled': bool(r.get('DefenderRealtimeProtectionEnabled')),
                'defenderSignatureAgeDays': r.get('DefenderSignatureAgeDays'),
                'defenderSignatureVersion': r.get('DefenderSignatureVersion'),
                'securityStatusUpdatedAt': to_iso(r.get('SecurityStatusUpdatedAt')),
                'status': compute_status(r.get('LastHeartbeatTime'), r.get('SuspendedAt'))
            })
        return jsonify(devices), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/devices/<device_id>/metrics', methods=['GET'])
def get_device_metrics(device_id):
    import psycopg2.extras
    key = _resolve_device_key(device_id) or device_id
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Live status from heartbeat recency (online < 3 min, sleep if suspended).
        cur.execute('SELECT "LastHeartbeatTime","SuspendedAt" FROM devices WHERE "DeviceId"=%s OR "Id"::text=%s;', (key, str(device_id)))
        d = cur.fetchone()
        status = 'Offline'
        if d and d['LastHeartbeatTime']:
            import datetime
            age = (datetime.datetime.now(datetime.timezone.utc) - d['LastHeartbeatTime']).total_seconds()
            if age < 180:
                status = 'Online'
            elif d['SuspendedAt']:
                status = 'Sleep'
        cur.execute('SELECT * FROM device_metrics WHERE device_id=%s;', (key,))
        m = cur.fetchone()
        cur.close()
        conn.close()
        if not m:
            return jsonify({'status': status}), 200
        return jsonify({
            'status': status,
            'collectedAt': to_iso(m['collected_at']),
            'cpuUsagePercent': m['cpu_percent'],
            'memoryUsedMb': m['mem_used_mb'],
            'memoryTotalMb': m['mem_total_mb'],
            'memoryUsagePercent': m['mem_percent'],
            'diskUsedGb': m['disk_used_gb'],
            'diskTotalGb': m['disk_total_gb'],
            'diskUsagePercent': m['disk_percent'],
            'uptimeSeconds': m['uptime_seconds'],
            'hasBattery': m['has_battery'],
            'batteryPercent': m['battery_percent'],
            'batteryCharging': m['battery_charging'],
            'agentVersion': m['agent_version'],
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def _resolve_device_key(id_or_device_id):
    """Map an internal device Id (what the console passes) or a DeviceId string
    to the DeviceId used as the key in installed_applications/app_usage_records."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT "DeviceId" FROM devices WHERE "Id"::text = %s OR "DeviceId" = %s LIMIT 1;',
                    (str(id_or_device_id), str(id_or_device_id)))
        row = cur.fetchone()
        cur.close()
        conn.close()
        return row[0] if row else None
    except Exception:
        return None


@app.route('/api/devices/installed-apps', methods=['POST'])
def report_installed_apps():
    """Agent report: replace this device's installed-application inventory."""
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    if not device_id:
        return jsonify({'error': 'device id required'}), 400
    data = request.get_json() or {}
    apps = data.get('applications', []) or []
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        def cap(v, n):
            return v[:n] if isinstance(v, str) and len(v) > n else v
        cur.execute('DELETE FROM installed_applications WHERE device_id = %s;', (device_id,))
        for a in apps:
            name = (a.get('name') or '').strip()
            if not name:
                continue
            # Truncate every field to its column limit so one over-length value
            # (e.g. a Store app's long certificate-subject publisher) can't fail
            # the whole batch.
            cur.execute(
                'INSERT INTO installed_applications (device_id, name, version, publisher, executable_name, is_store_app) '
                'VALUES (%s, %s, %s, %s, %s, %s);',
                (device_id, cap(name, 300), cap(a.get('version') or None, 100),
                 cap(a.get('publisher') or None, 200), cap(a.get('executableName') or None, 260),
                 bool(a.get('isStoreApp'))))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'count': len(apps)}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/installed-apps', methods=['GET'])
def get_device_installed_apps(device_id):
    key = _resolve_device_key(device_id) or device_id
    try:
        import psycopg2.extras
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute('SELECT id, name, version, publisher, executable_name, is_store_app '
                    'FROM installed_applications WHERE device_id = %s ORDER BY name;', (key,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([{
            'id': str(r['id']), 'name': r['name'], 'version': r['version'],
            'publisher': r['publisher'], 'executableName': r['executable_name'],
            'isStoreApp': r['is_store_app']
        } for r in rows]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/app-usage', methods=['POST'])
def report_app_usage():
    """Agent report: add today's foreground-time deltas per application."""
    import datetime
    device_id = (request.headers.get('X-Device-Id') or '').strip()
    if not device_id:
        return jsonify({'error': 'device id required'}), 400
    data = request.get_json() or {}
    records = data.get('usageRecords', []) or []
    today = datetime.date.today()
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        for rec in records:
            name = (rec.get('applicationName') or '').strip()
            secs = int(rec.get('durationSeconds') or 0)
            if not name or secs <= 0:
                continue
            cur.execute(
                'INSERT INTO app_usage_records (device_id, application_name, usage_date, duration_seconds, last_updated) '
                'VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP) '
                'ON CONFLICT (device_id, application_name, usage_date) DO UPDATE SET '
                'duration_seconds = app_usage_records.duration_seconds + EXCLUDED.duration_seconds, '
                'last_updated = CURRENT_TIMESTAMP;',
                (device_id, name[:300], today, secs))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'count': len(records)}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/app-usage', methods=['GET'])
def get_device_app_usage(device_id):
    import datetime
    key = _resolve_device_key(device_id) or device_id
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT application_name, duration_seconds FROM app_usage_records '
                    'WHERE device_id = %s AND usage_date = %s ORDER BY duration_seconds DESC;',
                    (key, datetime.date.today()))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([{'applicationName': r[0], 'durationSeconds': r[1]} for r in rows]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/devices/<device_id>/network-usage', methods=['GET'])
def get_device_network_usage(device_id):
    key = _resolve_device_key(device_id) or device_id
    days = int(request.args.get('days', 7))
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('SELECT usage_date, bytes_sent, bytes_received FROM network_usage_records '
                    'WHERE device_id=%s AND usage_date >= CURRENT_DATE - %s::int ORDER BY usage_date;', (key, days))
        rows = cur.fetchall(); cur.close(); conn.close()
        return jsonify([{'date': r[0].isoformat(), 'bytesSent': int(r[1] or 0), 'bytesReceived': int(r[2] or 0)} for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/work-time', methods=['GET'])
def get_device_work_time(device_id):
    key = _resolve_device_key(device_id) or device_id
    days = int(request.args.get('days', 7))
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('SELECT work_date, worked_seconds FROM work_session_records '
                    'WHERE device_id=%s AND work_date >= CURRENT_DATE - %s::int ORDER BY work_date;', (key, days))
        rows = cur.fetchall(); cur.close(); conn.close()
        return jsonify([{'date': r[0].isoformat(), 'workedSeconds': int(r[1] or 0)} for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def _os_group(os_version):
    v = (os_version or '').lower()
    if 'windows' in v or 'microsoft' in v:
        return 'windows'
    if 'mac' in v or 'darwin' in v or 'os x' in v:
        return 'macos'
    if any(k in v for k in ('ubuntu', 'linux', 'debian', 'fedora', 'centos', 'red hat', 'redhat')):
        return 'linux'
    return 'other'


@app.route('/api/overview', methods=['GET'])
def get_overview():
    """Live aggregate data for the tenant dashboard overview: OS distribution,
    current per-device resource usage, recent activity, and security alerts."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # --- OS distribution (grouped by OS version) ---
        cur.execute('SELECT COALESCE(NULLIF("OSVersion", \'\'), \'Unknown\') AS os, COUNT(*) '
                    'FROM devices GROUP BY os ORDER BY COUNT(*) DESC;')
        os_rows = cur.fetchall()
        os_total = sum(r[1] for r in os_rows) or 1
        os_distribution = [{
            'name': r[0], 'count': r[1],
            'percentage': round(r[1] * 100 / os_total),
            'group': _os_group(r[0]),
        } for r in os_rows]

        # --- Current per-device resource usage (latest snapshot) ---
        cur.execute('SELECT d."DeviceName", m.cpu_percent, m.mem_percent, m.disk_percent '
                    'FROM device_metrics m JOIN devices d ON d."DeviceId" = m.device_id '
                    'ORDER BY m.cpu_percent DESC NULLS LAST LIMIT 8;')
        performance = [{
            'label': r[0] or '—',
            'cpu': round(float(r[1])) if r[1] is not None else 0,
            'memory': round(float(r[2])) if r[2] is not None else 0,
            'disk': round(float(r[3])) if r[3] is not None else 0,
        } for r in cur.fetchall()]

        # --- Recent activity: install/uninstall commands + device registrations/activations ---
        activity = []
        cur.execute('SELECT c.type, c.target_app_name, c.status, c.created_at, d."DeviceName" '
                    'FROM device_commands c LEFT JOIN devices d ON d."DeviceId" = c.device_id '
                    'ORDER BY c.created_at DESC LIMIT 8;')
        for r in cur.fetchall():
            activity.append({'type': f'{r[0]} App', 'subject': r[1] or '—',
                             'actor': r[4] or '—', 'timestamp': to_iso(r[3]),
                             'status': r[2] or 'Pending', 'category': 'command'})
        cur.execute('SELECT "DeviceName", "CreatedDate", "ActivatedAt" FROM devices '
                    'ORDER BY "CreatedDate" DESC NULLS LAST LIMIT 5;')
        for r in cur.fetchall():
            if r[2]:
                activity.append({'type': 'Device Activation', 'subject': r[0] or '—',
                                 'actor': r[0] or '—', 'timestamp': to_iso(r[2]),
                                 'status': 'Activated', 'category': 'activation'})
            activity.append({'type': 'Device Registration', 'subject': r[0] or '—',
                             'actor': r[0] or '—', 'timestamp': to_iso(r[1]),
                             'status': 'Registered', 'category': 'registration'})
        activity = sorted([a for a in activity if a['timestamp']],
                          key=lambda a: a['timestamp'], reverse=True)[:8]

        # --- Security alerts (threats), if the table exists ---
        alerts = []
        cur.execute("SELECT to_regclass('public.device_threats');")
        if cur.fetchone()[0] is not None:
            cur.execute('SELECT t.id, t.name, t.severity, t.detected_at, t.remediated, d."DeviceName" '
                        'FROM device_threats t LEFT JOIN devices d ON d."DeviceId" = t.device_id '
                        'WHERE COALESCE(t.remediated, false) = false '
                        'ORDER BY t.detected_at DESC NULLS LAST LIMIT 8;')
            def _sev_label(s):
                try:
                    s = int(s)
                except (TypeError, ValueError):
                    return 'Medium'
                return 'Severe' if s >= 5 else 'High' if s == 4 else 'Medium' if s >= 2 else 'Low'
            for r in cur.fetchall():
                alerts.append({'id': str(r[0]), 'title': r[1] or 'Threat detected',
                               'severity': _sev_label(r[2]), 'detectedAt': to_iso(r[3]),
                               'device': r[5] or 'Unknown device', 'remediated': bool(r[4])})

        cur.close()
        conn.close()
        return jsonify({
            'osDistribution': os_distribution,
            'performance': performance,
            'activity': activity,
            'alerts': alerts,
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/threats', methods=['GET'])
def get_device_threats(device_id):
    key = _resolve_device_key(device_id) or device_id
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('SELECT id, name, severity, detected_at, remediated, resource FROM device_threats '
                    'WHERE device_id=%s ORDER BY detected_at DESC NULLS LAST;', (key,))
        rows = cur.fetchall(); cur.close(); conn.close()
        return jsonify([{'id': str(r[0]), 'name': r[1], 'severity': r[2], 'detectedAt': to_iso(r[3]),
                         'remediated': bool(r[4]), 'resource': r[5]} for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/commands', methods=['GET'])
def get_device_commands(device_id):
    key = _resolve_device_key(device_id) or device_id
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('SELECT c.id, c.type, c.target_app_name, c.status, c.result_message, c.created_at, c.updated_at, '
                    'COALESCE(p.display_name, p.file_name) '
                    'FROM device_commands c LEFT JOIN installer_packages p ON c.package_id = p.id '
                    'WHERE c.device_id=%s ORDER BY c.created_at DESC LIMIT 50;', (key,))
        rows = cur.fetchall(); cur.close(); conn.close()
        return jsonify([{'id': str(r[0]), 'type': r[1], 'targetAppName': r[2], 'status': r[3],
                         'resultMessage': r[4], 'createdAt': to_iso(r[5]), 'updatedAt': to_iso(r[6]),
                         'packageName': r[7]} for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/commands', methods=['POST'])
def queue_install_command(device_id):
    key = _resolve_device_key(device_id) or device_id
    cmd_type = 'Update' if (request.args.get('type', '').lower() == 'update') else 'Install'
    data = request.json or {}
    package_id = data.get('packageId')
    if not package_id:
        return jsonify({'message': 'packageId is required'}), 400
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute("INSERT INTO device_commands (device_id, type, package_id, status) VALUES (%s,%s,%s,'Pending') RETURNING id;",
                    (key, cmd_type, str(package_id)))
        cid = cur.fetchone()[0]; conn.commit(); cur.close(); conn.close()
        return jsonify({'id': str(cid), 'type': cmd_type, 'status': 'Pending'}), 202
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/devices/<device_id>/installed-apps/<app_id>/uninstall', methods=['POST'])
def queue_uninstall_command(device_id, app_id):
    key = _resolve_device_key(device_id) or device_id
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('SELECT name, version, is_store_app FROM installed_applications WHERE id::text=%s;', (str(app_id),))
        app = cur.fetchone()
        if not app:
            cur.close(); conn.close()
            return jsonify({'message': 'Application not found'}), 404
        cur.execute("INSERT INTO device_commands (device_id, type, target_app_name, target_app_version, target_is_store_app, status) "
                    "VALUES (%s,'Uninstall',%s,%s,%s,'Pending') RETURNING id;", (key, app[0], app[1], bool(app[2])))
        cid = cur.fetchone()[0]; conn.commit(); cur.close(); conn.close()
        return jsonify({'id': str(cid), 'type': 'Uninstall', 'status': 'Pending'}), 202
    except Exception as e:
        return jsonify({'message': str(e)}), 500


def normalize_domain(raw):
    """Reduce user input (a full URL, host with port, www. prefix, path, etc.)
    to a bare registrable hostname suitable for a hosts-file entry.
    e.g. 'https://www.YouTube.com/watch?v=1' -> 'youtube.com'. Returns '' if
    nothing host-like remains."""
    import re
    d = (raw or '').strip().lower()
    if not d:
        return ''
    d = re.sub(r'^[a-z][a-z0-9+.\-]*://', '', d)   # strip scheme
    d = d.split('/')[0].split('?')[0].split('#')[0]  # drop path/query/fragment
    if '@' in d:
        d = d.split('@')[-1]                         # drop userinfo
    d = d.split(':')[0]                              # drop port
    if d.startswith('www.'):
        d = d[4:]                                    # drop leading www.
    d = d.strip('.')
    # Reject anything that isn't a plausible hostname (must have a dot, valid chars).
    if '.' not in d or not re.match(r'^[a-z0-9.\-]+$', d):
        return ''
    return d


@app.route('/api/devices/<device_id>/blocked-websites', methods=['GET'])
def get_device_blocked_websites(device_id):
    key = _resolve_device_key(device_id) or device_id
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('SELECT id, domain FROM blocked_websites WHERE device_id=%s ORDER BY domain;', (key,))
        rows = cur.fetchall(); cur.close(); conn.close()
        return jsonify([{'id': str(r[0]), 'domain': r[1]} for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/blocked-websites', methods=['POST'])
def add_device_blocked_website(device_id):
    key = _resolve_device_key(device_id) or device_id
    data = request.json or {}
    domain = normalize_domain(data.get('domain'))
    if not domain:
        return jsonify({'message': 'Enter a valid website domain (e.g. youtube.com).'}), 400
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('INSERT INTO blocked_websites (device_id, domain) VALUES (%s,%s) '
                    'ON CONFLICT (device_id, domain) DO NOTHING RETURNING id;', (key, domain))
        row = cur.fetchone()
        if row is None:
            cur.execute('SELECT id FROM blocked_websites WHERE device_id=%s AND domain=%s;', (key, domain))
            row = cur.fetchone()
        conn.commit(); cur.close(); conn.close()
        return jsonify({'id': str(row[0]), 'domain': domain}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/devices/<device_id>/blocked-websites/<block_id>', methods=['DELETE'])
def remove_device_blocked_website(device_id, block_id):
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('DELETE FROM blocked_websites WHERE id::text=%s;', (str(block_id),))
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/usb-blocking', methods=['PUT'])
def update_device_usb_blocking(device_id):
    data = request.json or {}
    enabled = bool(data.get('enabled', False))
    duration = data.get('durationMinutes')
    try:
        conn = get_db_connection(); cur = conn.cursor()
        if enabled and duration:
            cur.execute('UPDATE devices SET "UsbBlockingEnabled"=%s, '
                        '"UsbBlockingUntil"=CURRENT_TIMESTAMP + make_interval(mins => %s) '
                        'WHERE "Id"::text=%s OR "DeviceId"=%s;', (enabled, int(duration), str(device_id), str(device_id)))
        else:
            cur.execute('UPDATE devices SET "UsbBlockingEnabled"=%s, "UsbBlockingUntil"=NULL '
                        'WHERE "Id"::text=%s OR "DeviceId"=%s;', (enabled, str(device_id), str(device_id)))
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True, 'usbBlockingEnabled': enabled}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/login-policy', methods=['PUT'])
def update_device_login_policy(device_id):
    data = request.json or {}
    enabled = bool(data.get('enabled', False))
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('UPDATE devices SET "RequireLoginEachStartup"=%s WHERE "Id"::text=%s OR "DeviceId"=%s;',
                    (enabled, str(device_id), str(device_id)))
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True, 'requireLoginEachStartup': enabled}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/devices/<device_id>/store-gating', methods=['PUT'])
def update_device_store_gating(device_id):
    data = request.json or {}
    enabled = bool(data.get('enabled', False))
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('UPDATE devices SET "StoreGatingEnabled"=%s WHERE "Id"::text=%s OR "DeviceId"=%s;',
                    (enabled, str(device_id), str(device_id)))
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True, 'storeGatingEnabled': enabled}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── APP USERS API ENDPOINTS (NEON DB) ──
@app.route('/api/app-users', methods=['GET'])
@app.route('/api/users', methods=['GET'])
def get_app_users():
    try:
        import psycopg2.extras
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT u.*, d."DeviceName", d."Model", d."IPAddress"
            FROM app_users u
            LEFT JOIN devices d ON u."DeviceId" = d."DeviceId"
            ORDER BY u."Id" ASC;
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        users = []
        for r in rows:
            users.append({
                'id': r['Id'],
                'email': r['Email'],
                'employeeCode': r['EmployeeCode'],
                'username': r['Username'],
                'createdDate': r['CreatedDate'].isoformat() if r['CreatedDate'] else None,
                'deviceId': r['DeviceId'],
                'deviceName': r['DeviceName'],
                'deviceModel': r['Model'],
                'deviceIp': r['IPAddress']
            })
        return jsonify(users), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/app-users', methods=['POST'])
@app.route('/api/users', methods=['POST'])
def create_app_user():
    try:
        data = request.json or {}
        email = data.get('email', '').strip()
        emp_code = data.get('employeeCode', '').strip()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        device_id = data.get('deviceId', '').strip()

        if not email or not username:
            return jsonify({'error': 'Email and username are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO app_users ("Email", "EmployeeCode", "Username", "PasswordHash", "DeviceId")
            VALUES (%s, %s, %s, %s, %s)
            RETURNING "Id", "CreatedDate";
        """, (email, emp_code, username, password, device_id or None))
        new_row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'id': new_row[0],
            'email': email,
            'employeeCode': emp_code,
            'username': username,
            'createdDate': new_row[1].isoformat() if new_row[1] else None,
            'deviceId': device_id
        }), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/app-users/<int:user_id>', methods=['PUT'])
@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_app_user(user_id):
    try:
        data = request.json or {}
        email = data.get('email', '').strip()
        emp_code = data.get('employeeCode', '').strip()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        conn = get_db_connection()
        cur = conn.cursor()
        if password:
            cur.execute("""
                UPDATE app_users
                SET "Email" = %s, "EmployeeCode" = %s, "Username" = %s, "PasswordHash" = %s
                WHERE "Id" = %s;
            """, (email, emp_code, username, password, user_id))
        else:
            cur.execute("""
                UPDATE app_users
                SET "Email" = %s, "EmployeeCode" = %s, "Username" = %s
                WHERE "Id" = %s;
            """, (email, emp_code, username, user_id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'id': user_id, 'email': email, 'employeeCode': emp_code, 'username': username}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/app-users/<int:user_id>', methods=['DELETE'])
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_app_user(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM app_users WHERE "Id" = %s;', (user_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'id': user_id}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ── LICENSE KEY & PRODUCT DOWNLOAD API ENDPOINTS ──
@app.route('/api/verify-license-download', methods=['POST'])
def verify_license_download():
    try:
        data = request.get_json() or {}
        license_key = data.get('licenseKey', '').strip()

        if not license_key:
            return jsonify({'success': False, 'error': 'License key is required'}), 400

        # Check against database tenants
        tenant_match = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                SELECT id, tenant_name, product_name, status, expiry_date 
                FROM tenants 
                WHERE LOWER(license_key) = LOWER(%s);
            """, (license_key,))
            tenant_match = cur.fetchone()
            cur.close()
            conn.close()
        except Exception as db_err:
            print(f"License DB query error (falling back to key check): {db_err}")

        # Standard accepted demo keys for quick validation/testing
        valid_demo_keys = ['LANCE-EMS-2026-KEY', 'LANCE-DEMO-9988', 'DEMO-LICENSE-KEY', 'LANCE-2026-PRO', 'LANCE-ENTERPRISE-KEY']
        is_key_valid = bool(tenant_match) or (license_key.upper() in valid_demo_keys) or (license_key.upper().startswith('LANCE-') and len(license_key) >= 10)

        if is_key_valid:
            tenant_info = {
                'tenantName': tenant_match[1] if tenant_match else 'Nexus Global Systems',
                'productName': tenant_match[2] if tenant_match else 'Endpoint Management System',
                'status': tenant_match[3] if tenant_match else 'Active',
                'expiryDate': tenant_match[4] if tenant_match else '2026-12-31',
                'downloadUrl': '/api/download-file',
                'fileName': 'The_Lance_EMS_Setup_v2.4.zip'
            }
            return jsonify({
                'success': True,
                'message': 'License key verified successfully!',
                'tenant': tenant_info
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired license key. Please check your key and try again.'
            }), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

def get_installer_bytes():
    """Returns (filename, bytes) for the agent installer to bundle in the
    download zip. The DB (app_installers) is the source of truth in production
    (Render has no persistent disk), with the local build output as a dev
    fallback. Returns (None, None) if no installer is available."""
    # 1) Database (production).
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT to_regclass('public.app_installers');")
        if cur.fetchone()[0] is not None:
            cur.execute('SELECT file_name, content FROM app_installers '
                        'ORDER BY uploaded_at DESC LIMIT 1;')
            row = cur.fetchone()
            if row and row[1] is not None:
                cur.close(); conn.close()
                return (row[0] or 'TheLanceEMSSetup.exe', bytes(row[1]))
        cur.close(); conn.close()
    except Exception as e:
        print(f"Installer DB lookup failed: {e}")

    # 2) Local filesystem (dev convenience).
    import glob
    here = os.path.dirname(__file__)
    candidates = glob.glob(os.path.join(here, 'artifacts', '*.exe'))
    build_output = os.path.abspath(os.path.join(here, '..', 'EMS', 'installer', 'output'))
    candidates += glob.glob(os.path.join(build_output, 'TheLanceEMSSetup-*.exe'))
    candidates += glob.glob(os.path.join(build_output, 'EMSAgentSetup-*.exe'))
    candidates = [c for c in candidates if os.path.isfile(c)]
    if candidates:
        path = max(candidates, key=os.path.getmtime)
        with open(path, 'rb') as f:
            return ('TheLanceEMSSetup.exe', f.read())
    return (None, None)


@app.route('/api/download-file', methods=['GET'])
def download_product_file():
    """
    Streams a zip of the latest agent installer bundled with the tenant's
    license key (license.key), so the client can install on many devices from
    one download.

    License resolution:
      * ?licenseKey=... explicitly (validated against tenants), or
      * the logged-in tenant admin's session token -> tenant by admin/tenant
        e-mail (so the dashboard Download button needs no key input).
    """
    try:
        import io
        import re
        import zipfile
        from flask import send_file

        license_key = (request.args.get('licenseKey') or '').strip()
        tenant_name = None

        if license_key:
            # Explicit key: validate it (accept LANCE- demo keys for testing).
            try:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute("SELECT tenant_name FROM tenants WHERE LOWER(license_key) = LOWER(%s);", (license_key,))
                row = cur.fetchone()
                cur.close()
                conn.close()
                if row:
                    tenant_name = row[0]
            except Exception as db_err:
                print(f"Download license check error: {db_err}")

            demo_ok = license_key.upper().startswith('LANCE-') and len(license_key) >= 10
            if not tenant_name and not demo_ok:
                return jsonify({'error': 'Invalid or unknown license key.'}), 403
        else:
            # No key supplied: resolve the tenant from the logged-in admin.
            payload = verify_token(
                request.headers.get('Authorization') or request.headers.get('X-Auth-Token') or '')
            email = (payload or {}).get('email')
            if not email:
                return jsonify({'error': 'Sign in to download the installer.'}), 401

            try:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute(
                    "SELECT tenant_name, license_key FROM tenants "
                    "WHERE LOWER(admin_mail) = LOWER(%s) OR LOWER(tenant_mail) = LOWER(%s) LIMIT 1;",
                    (email, email))
                row = cur.fetchone()
                cur.close()
                conn.close()
                if row:
                    tenant_name, license_key = row[0], (row[1] or '')
            except Exception as db_err:
                print(f"Download tenant resolve error: {db_err}")

            if not license_key:
                return jsonify({
                    'error': 'No license is linked to your account. Contact your administrator.'
                }), 403

        installer_name, installer_bytes = get_installer_bytes()
        if not installer_bytes:
            return jsonify({
                'error': 'The installer is not available yet. Please contact your administrator.'
            }), 503

        readme = (
            "The Lance Endpoint - Installation\n"
            "=================================\n\n"
            "1. Keep TheLanceEMSSetup.exe and license.key together in this folder.\n"
            "2. Run TheLanceEMSSetup.exe as Administrator on each device.\n"
            "3. The installer applies your license key automatically.\n"
            "4. When the activation window opens, sign in with your employee\n"
            "   code and password.\n\n"
            f"Tenant: {tenant_name or 'N/A'}\n"
            f"License key: {license_key}\n"
        )

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('TheLanceEMSSetup.exe', installer_bytes)
            zf.writestr('license.key', license_key + '\n')
            zf.writestr('README.txt', readme)
        buffer.seek(0)

        slug = re.sub(r'[^A-Za-z0-9]+', '-', (tenant_name or 'TheLance')).strip('-') or 'TheLance'
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f'{slug}-TheLanceEndpoint.zip',
            mimetype='application/zip'
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Serve React Frontend SPA / Fallback Route
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')

def serve_frontend(path):
    if path != "" and app.static_folder and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({
        "status": "online",
        "message": "The Lance API Server is running smoothly",
        "health": "/api/health",
        "products": "/api/products"
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

