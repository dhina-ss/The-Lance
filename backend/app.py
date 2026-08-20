import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "The Lance Flask API server is running smoothly",
        "version": "1.0.0"
    })

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
