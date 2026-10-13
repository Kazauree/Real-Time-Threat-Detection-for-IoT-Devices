import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import SessionLocal, User, SecurityLog

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
JWT_SECRET = os.getenv("JWT_SECRET", "iot-cybersecurity-secret-key-2026")
JWT_ALGORITHM = "HS256"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            else:
                token = auth_header

        if not token:
            return jsonify({"error": "Authentication token missing"}), 401
            
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            db = SessionLocal()
            user = db.query(User).filter(User.id == payload["user_id"]).first()
            db.close()
            if not user:
                return jsonify({"error": "User not found"}), 401
            request.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token"}), 401
            
        return f(*args, **kwargs)
    return decorated

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "Security Analyst")
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
        
    db = SessionLocal()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.close()
        return jsonify({"error": "User with this email already exists"}), 400
        
    hashed_pw = generate_password_hash(password)
    new_user = User(name=name, email=email, password_hash=hashed_pw, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    log = SecurityLog(user_id=new_user.id, action="USER_REGISTERED", description=f"New user registered: {name} ({role})")
    db.add(log)
    db.commit()
    db.close()
    
    return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        log = SecurityLog(action="FAILED_LOGIN", description=f"Failed login attempt for email: {email}")
        db.add(log)
        db.commit()
        db.close()
        return jsonify({"error": "Invalid email or password"}), 401
        
    token = jwt.encode({
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(days=7)
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    log = SecurityLog(user_id=user.id, action="USER_LOGIN", description=f"User {user.name} logged in successfully")
    db.add(log)
    db.commit()
    
    user_info = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }
    db.close()
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user_info
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me():
    user = request.current_user
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() + "Z"
    })
