import sys
import os
import joblib
import numpy as np

# Ensure parent and ml directory are in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from preprocess import IoTPreprocessor, PREPROCESSOR_PATH

MODEL_PATH = "ml/saved_models/random_forest.pkl"

class IoTPredictor:
    """
    Singleton service class that loads the trained Random Forest model and preprocessor
    into memory for fast real-time inference.
    """
    _instance = None

    def __init__(self, model_path=MODEL_PATH, preprocessor_path=PREPROCESSOR_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at '{model_path}'. Please run train_model.py first.")
        
        self.model = joblib.load(model_path)
        self.preprocessor = IoTPreprocessor.load(preprocessor_path)
        self.classes = self.preprocessor.classes_
        self.feature_names = self.preprocessor.feature_names
        print(f"[+] IoTPredictor initialized successfully with classes: {self.classes}")

    @classmethod
    def get_instance(cls, model_path=MODEL_PATH, preprocessor_path=PREPROCESSOR_PATH):
        if cls._instance is None:
            cls._instance = cls(model_path, preprocessor_path)
        return cls._instance

    def predict(self, feature_dict):
        """
        Processes a raw input dictionary of traffic features and returns prediction details:
        - prediction label
        - confidence score (probability)
        - severity level (SAFE, LOW, MEDIUM, HIGH, CRITICAL)
        - feature breakdown / indicators
        """
        X_scaled = self.preprocessor.transform_single(feature_dict)
        pred_idx = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        
        predicted_class = self.classes[pred_idx]
        confidence = float(probabilities[pred_idx])
        
        # Severity Mapping
        severity_map = {
            "Normal": "SAFE",
            "Suspicious": "MEDIUM",
            "Port Scan": "HIGH",
            "Brute Force": "HIGH",
            "DoS": "CRITICAL",
            "Botnet": "CRITICAL"
        }
        severity = severity_map.get(predicted_class, "MEDIUM")
        
        # Top contributing features for explainability
        feat_importances = dict(zip(self.feature_names, self.model.feature_importances_))
        sorted_feats = sorted(feat_importances.items(), key=lambda x: x[1], reverse=True)[:5]
        
        indicators = []
        if predicted_class == "DoS":
            indicators = ["Extremely high packet transmission rate", "Short flow duration", "Low packet size variance"]
        elif predicted_class == "Port Scan":
            indicators = ["High destination port entropy", "Low packet count per flow", "Rapid connection sweeps"]
        elif predicted_class == "Brute Force":
            indicators = ["High port 22/23/80 access attempts", "Repetitive protocol flow sizes", "Extended session duration"]
        elif predicted_class == "Botnet":
            indicators = ["Non-standard IRC/C2 destination ports", "Periodic heartbeat pattern", "Suspicious byte transfer ratio"]
        elif predicted_class == "Suspicious":
            indicators = ["Anomalous payload size distribution", "Unusual port range", "Irregular flow dynamics"]
        else:
            indicators = ["Standard protocol behavior", "Normal packet size distribution", "Expected destination port"]

        return {
            "prediction": predicted_class,
            "confidence": round(confidence, 4),
            "severity": severity,
            "is_threat": predicted_class != "Normal",
            "class_probabilities": {
                cls_name: round(float(prob), 4) for cls_name, prob in zip(self.classes, probabilities)
            },
            "top_indicators": indicators,
            "top_model_features": [f[0] for f in sorted_feats]
        }

if __name__ == "__main__":
    predictor = IoTPredictor.get_instance()
    sample_flow = {
        "flow_duration": 150,
        "packet_count": 2500,
        "byte_count": 150000,
        "pkt_len_mean": 60,
        "pkt_len_std": 2.0,
        "flow_pkts_per_sec": 16666.6,
        "flow_bytes_per_sec": 1000000.0,
        "port_entropy": 0.4,
        "dest_port": 80,
        "protocol": "TCP"
    }
    res = predictor.predict(sample_flow)
    print("Sample Prediction Result:", res)
