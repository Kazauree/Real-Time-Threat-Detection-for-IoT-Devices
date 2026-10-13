import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dataset.generate_iot_dataset import generate_iot_dataset
from preprocess import load_and_preprocess_data, PREPROCESSOR_PATH

MODEL_PATH = "ml/saved_models/random_forest.pkl"
METADATA_PATH = "ml/saved_models/model_metadata.json"

def train_and_evaluate_model(dataset_path="ml/dataset/iot_network_traffic.csv", n_estimators=100, max_depth=15):
    """
    Trains a Random Forest Classifier on the IoT dataset, computes model evaluation metrics,
    and exports trained model artifacts and metadata.
    """
    if not os.path.exists(dataset_path):
        print(f"[*] Dataset not found at '{dataset_path}'. Generating synthetic IoT dataset...")
        generate_iot_dataset(output_path=dataset_path)

    print("[*] Preprocessing dataset and preparing stratified train/test splits...")
    X_train, X_test, y_train, y_test, preprocessor, feature_names, classes = load_and_preprocess_data(dataset_path)
    
    preprocessor.save(PREPROCESSOR_PATH)
    
    print(f"[*] Training Random Forest Classifier (n_estimators={n_estimators}, max_depth={max_depth})...")
    clf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    print("[*] Evaluating model performance on 20% holdout test set...")
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)
    
    # Calculate key metrics
    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, average="weighted"))
    recall = float(recall_score(y_test, y_pred, average="weighted"))
    f1 = float(f1_score(y_test, y_pred, average="weighted"))
    
    cm = confusion_matrix(y_test, y_pred)
    cm_list = cm.tolist()
    
    # False Positives and Negatives calculation
    # Normal is class index where classes[i] == 'Normal'
    normal_idx = classes.index("Normal") if "Normal" in classes else 0
    fp = int(sum(cm[normal_idx, j] for j in range(len(classes)) if j != normal_idx))
    fn = int(sum(cm[i, normal_idx] for i in range(len(classes)) if i != normal_idx))
    
    # Feature Importances
    importances = clf.feature_importances_
    feat_imp_list = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
    ]
    
    # Classification Report dict
    report_dict = classification_report(y_test, y_pred, target_names=classes, output_dict=True)
    
    metadata = {
        "model_name": "Random Forest IoT Intrusion Classifier",
        "algorithm": "RandomForestClassifier",
        "version": "RF-IOT-v1.0",
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "parameters": {
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "class_weight": "balanced",
            "random_state": 42
        },
        "dataset_info": {
            "total_records": len(X_train) + len(X_test),
            "train_records": len(X_train),
            "test_records": len(X_test),
            "num_features": len(feature_names),
            "features": feature_names,
            "classes": classes
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "false_positives": fp,
            "false_negatives": fn,
            "confusion_matrix": cm_list,
            "classification_report": report_dict,
            "feature_importances": feat_imp_list
        }
    }
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    print(f"[+] Saved Random Forest model to '{MODEL_PATH}'")
    
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Saved model performance metadata to '{METADATA_PATH}'")
    
    print("\n=======================================================")
    print("                MODEL TRAINING SUMMARY                 ")
    print("=======================================================")
    print(f" Algorithm    : Random Forest Classifier (v1.0)")
    print(f" Accuracy     : {accuracy * 100:.2f}%")
    print(f" Precision    : {precision * 100:.2f}%")
    print(f" Recall       : {recall * 100:.2f}%")
    print(f" F1 Score     : {f1 * 100:.2f}%")
    print(f" False Pos    : {fp}")
    print(f" False Neg    : {fn}")
    print("=======================================================\n")
    
    return clf, metadata

if __name__ == "__main__":
    train_and_evaluate_model()
