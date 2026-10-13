from flask import Blueprint, request, jsonify
from models.database import SessionLocal, SecurityLog, User

logs_bp = Blueprint("logs", __name__, url_prefix="/api/logs")

@logs_bp.route("", methods=["GET"])
def get_logs():
    db = SessionLocal()
    limit = int(request.args.get("limit", 50))
    action = request.args.get("action")
    
    query = db.query(SecurityLog)
    if action:
        query = query.filter(SecurityLog.action == action)
        
    logs = query.order_by(SecurityLog.created_at.desc()).limit(limit).all()
    
    res = []
    for l in logs:
        u = l.user
        res.append({
            "id": l.id,
            "user_id": l.user_id,
            "user_name": u.name if u else "System",
            "action": l.action,
            "ip_address": l.ip_address,
            "description": l.description,
            "created_at": l.created_at.isoformat() + "Z"
        })
    db.close()
    return jsonify(res)
