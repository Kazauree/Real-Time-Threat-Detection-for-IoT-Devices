import os
import json
import sys
from flask import Blueprint, jsonify, request
from models.database import SessionLocal, ModelVersion, SecurityLog
from api.auth import token_required

ml_bp = Blueprint("ml", __name__, url_prefix="/api/ml")
METADATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml/saved_models/model_metadata.json"))

@ml_bp.route("/metrics", methods=["GET"])
def get_ml_metrics():
    """Returns actual trained Random Forest model performance metrics."""
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r") as f:
                metadata = json.load(f)
            return jsonify(metadata)
        except Exception as e:
            return jsonify({"error": f"Failed to load model metadata: {str(e)}"}), 500
            
    # Fallback to database ModelVersion if json file unavailable
    db = SessionLocal()
    mv = db.query(ModelVersion).order_by(ModelVersion.trained_at.desc()).first()
    db.close()
    
    if not mv:
        return jsonify({"error": "Model metadata not found. Please train model first."}), 444
        
    return jsonify({
        "model_name": mv.model_name,
        "algorithm": mv.algorithm,
        "version": mv.version,
        "trained_at": mv.trained_at.isoformat() + "Z",
        "metrics": {
            "accuracy": mv.accuracy,
            "precision": mv.precision,
            "recall": mv.recall,
            "f1_score": mv.f1_score
        }
    })

@ml_bp.route("/features", methods=["GET"])
def get_feature_importances():
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r") as f:
            metadata = json.load(f)
        feats = metadata.get("metrics", {}).get("feature_importances", [])
        return jsonify(feats)
    return jsonify([])

@ml_bp.route("/retrain", methods=["POST"])
@token_required
def retrain_model():
    """Triggers dataset regeneration & Random Forest retraining."""
    try:
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
        from ml.train_model import train_and_evaluate_model
        
        clf, metadata = train_and_evaluate_model()
        
        # Save to DB
        db = SessionLocal()
        mv = ModelVersion(
            model_name=metadata["model_name"],
            algorithm=metadata["algorithm"],
            version=metadata["version"],
            accuracy=metadata["metrics"]["accuracy"],
            precision=metadata["metrics"]["precision"],
            recall=metadata["metrics"]["recall"],
            f1_score=metadata["metrics"]["f1_score"],
            model_path="ml/saved_models/random_forest.pkl"
        )
        db.add(mv)
        log = SecurityLog(user_id=request.current_user.id, action="MODEL_RETRAINED", description=f"Model retrained. Accuracy: {metadata['metrics']['accuracy']*100:.2f}%")
        db.add(log)
        db.commit()
        db.close()
        
        return jsonify({
            "message": "Random Forest model successfully retrained",
            "metadata": metadata
        })
    except Exception as e:
        return jsonify({"error": f"Retraining failed: {str(e)}"}), 500
