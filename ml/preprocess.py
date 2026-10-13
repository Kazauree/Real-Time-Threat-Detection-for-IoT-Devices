import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

PREPROCESSOR_PATH = "ml/saved_models/preprocessing_pipeline.pkl"

class IoTPreprocessor:
    """
    Handles cleaning, encoding, scaling, and feature transformation
    for IoT network traffic records.
    """
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.numerical_cols = [
            "flow_duration", "packet_count", "byte_count", 
            "pkt_len_mean", "pkt_len_std", "flow_pkts_per_sec", 
            "flow_bytes_per_sec", "port_entropy", "dest_port"
        ]
        self.protocol_categories = ["TCP", "UDP", "ICMP"]
        self.feature_names = []
        self.classes_ = []
        self.is_fitted = False

    def _encode_protocol(self, df):
        """Creates dummy columns for protocol categories ensuring consistent column order."""
        df_encoded = df.copy()
        for proto in self.protocol_categories:
            col_name = f"protocol_{proto}"
            df_encoded[col_name] = (df["protocol"].str.upper() == proto).astype(float)
        return df_encoded.drop(columns=["protocol"], errors="ignore")

    def fit_transform(self, df, label_col="label"):
        """Fits preprocessor on training DataFrame and returns transformed X and y."""
        df_clean = df.copy().dropna()
        
        # Extract target
        y_raw = df_clean[label_col]
        X_raw = df_clean.drop(columns=[label_col])
        
        # Encode target labels
        y_encoded = self.label_encoder.fit_transform(y_raw)
        self.classes_ = list(self.label_encoder.classes_)
        
        # Encode protocol
        X_encoded = self._encode_protocol(X_raw)
        
        # Extract numerical features for scaling
        X_num = X_encoded[self.numerical_cols]
        X_num_scaled = self.scaler.fit_transform(X_num)
        
        # Combine scaled numerical and dummy protocol features
        proto_cols = [f"protocol_{p}" for p in self.protocol_categories]
        X_scaled_df = pd.DataFrame(X_num_scaled, columns=self.numerical_cols, index=df_clean.index)
        for col in proto_cols:
            X_scaled_df[col] = X_encoded[col].values
            
        self.feature_names = list(X_scaled_df.columns)
        self.is_fitted = True
        
        return X_scaled_df.values, y_encoded, self.feature_names, self.classes_

    def transform_single(self, feature_dict):
        """
        Transforms a single raw feature dictionary (from API request) 
        into scaled numpy array ready for RandomForest inference.
        """
        if not self.is_fitted:
            raise ValueError("IoTPreprocessor must be fitted or loaded before calling transform_single()")
            
        df = pd.DataFrame([feature_dict])
        
        # Fill missing default keys if omitted
        default_keys = {
            "flow_duration": 100.0,
            "packet_count": 10,
            "byte_count": 1000.0,
            "pkt_len_mean": 100.0,
            "pkt_len_std": 10.0,
            "flow_pkts_per_sec": 10.0,
            "flow_bytes_per_sec": 1000.0,
            "port_entropy": 1.5,
            "dest_port": 80,
            "protocol": "TCP"
        }
        for k, v in default_keys.items():
            if k not in df.columns:
                df[k] = v
                
        df_encoded = self._encode_protocol(df)
        X_num = df_encoded[self.numerical_cols]
        X_num_scaled = self.scaler.transform(X_num)
        
        proto_cols = [f"protocol_{p}" for p in self.protocol_categories]
        X_scaled_df = pd.DataFrame(X_num_scaled, columns=self.numerical_cols)
        for col in proto_cols:
            X_scaled_df[col] = df_encoded[col].values
            
        return X_scaled_df[self.feature_names].values

    def save(self, file_path=PREPROCESSOR_PATH):
        """Saves fitted preprocessor to disk."""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        joblib.dump(self, file_path)
        print(f"[+] Saved preprocessing pipeline to '{file_path}'")

    @classmethod
    def load(cls, file_path=PREPROCESSOR_PATH):
        """Loads fitted preprocessor from disk."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Preprocessor file not found at '{file_path}'")
        instance = joblib.load(file_path)
        print(f"[+] Loaded preprocessing pipeline from '{file_path}'")
        return instance

def load_and_preprocess_data(dataset_path="ml/dataset/iot_network_traffic.csv", test_size=0.2, seed=42):
    """Utility to load dataset and return train/test split datasets."""
    df = pd.read_csv(dataset_path)
    preprocessor = IoTPreprocessor()
    X, y, feature_names, classes = preprocessor.fit_transform(df)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=seed, stratify=y
    )
    
    return X_train, X_test, y_train, y_test, preprocessor, feature_names, classes
