from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai
import numpy as np
import json
from datetime import datetime
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# ----------------- Load environment variables -----------------
load_dotenv()  # Load from .env
new_key = os.getenv("OPENAI_API_KEY")
# Force Flask to always use the .env key (overwrites any old OS env)
os.environ['OPENAI_API_KEY'] = new_key
openai.api_key = os.environ['OPENAI_API_KEY']

if not openai.api_key:
    print("[WARNING] OPENAI_API_KEY not set! /chat will fail.")
else:
    print("OPENAI_API_KEY loaded in Flask:", openai.api_key)

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# ----------------- File to store patient reports -----------------
REPORTS_FILE = 'patient_reports.json'

def save_report(report):
    if os.path.exists(REPORTS_FILE):
        with open(REPORTS_FILE, 'r') as f:
            data = json.load(f)
    else:
        data = []
    data.append(report)
    with open(REPORTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# ----------------- Initialize Flask -----------------
app = Flask(__name__)
CORS(app)

# ----------------- Load ML Models -----------------
try:
    model = load_model("backend/models/chest_xray_model.h5")
    print("Chest X-ray model loaded successfully!")
except Exception as e:
    print(f"[ERROR] Loading Chest X-ray model: {e}")
    model = None

try:
    model2 = load_model("backend/models/brain_tumor_model.h5")
    print("Brain tumor model loaded successfully!")
except Exception as e:
    print(f"[ERROR] Loading Brain tumor model: {e}")
    model2 = None

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# ----------------- Routes -----------------
@app.route('/')
def index():
    return jsonify({'message': 'ScanX API is running'})

# ----------------- Chest X-ray Prediction -----------------
@app.route('/predict/chest', methods=['POST'])
def predict_chest():
    if model is None:
        return jsonify({'error': 'Chest X-ray model not loaded'}), 500
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    img_path = os.path.join("uploads", file.filename)
    file.save(img_path)

    try:
        img = image.load_img(img_path, target_size=(150, 150))
        img = image.img_to_array(img)
        img = np.expand_dims(img, axis=0) / 255.0
        prediction = model.predict(img)[0]
        label = "PNEUMONIA" if prediction > 0.5 else "NORMAL"
        confidence = prediction if prediction > 0.5 else 1 - prediction

        report = {
            'filename': file.filename,
            'scan_type': 'chest',
            'result': label,
            'confidence': round(float(confidence) * 100, 2),
            'timestamp': str(datetime.now())
        }
        save_report(report)
        return jsonify({'Result': label, 'confidence': round(float(confidence) * 100, 2)})

    except Exception as e:
        print(f"[ERROR] Chest prediction failed: {e}")
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

# ----------------- Brain Tumor Prediction -----------------
@app.route('/predict/brain', methods=['POST'])
def predict_brain():
    if model2 is None:
        return jsonify({'error': 'Brain tumor model not loaded'}), 500
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    img_path = os.path.join("uploads", file.filename)
    file.save(img_path)

    try:
        img = image.load_img(img_path, target_size=(150, 150))
        img = image.img_to_array(img)
        img = np.expand_dims(img, axis=0) / 255.0
        prediction = model2.predict(img)[0]
        classes = ['glioma', 'meningioma', 'pituitary', 'no tumor']
        predicted_class = classes[np.argmax(prediction)]
        confidence = float(np.max(prediction))

        report = {
            'filename': file.filename,
            'scan_type': 'brain',
            'result': predicted_class,
            'confidence': round(confidence * 100, 2),
            'timestamp': str(datetime.now())
        }
        save_report(report)
        return jsonify({'Result': predicted_class, 'confidence': round(confidence * 100, 2)})

    except Exception as e:
        print(f"[ERROR] Brain prediction failed: {e}")
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

# ----------------- Fetch Reports -----------------
@app.route('/reports', methods=['GET'])
def get_reports():
    if os.path.exists(REPORTS_FILE):
        with open(REPORTS_FILE, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    return jsonify([])

# ----------------- Delete Report -----------------
@app.route('/delete-report/<int:index>', methods=['DELETE'])
def delete_report(index):
    if os.path.exists(REPORTS_FILE):
        with open(REPORTS_FILE, 'r') as f:
            data = json.load(f)
        if 0 <= index < len(data):
            deleted = data.pop(index)
            with open(REPORTS_FILE, 'w') as f:
                json.dump(data, f, indent=2)
            return jsonify({'message': 'Report deleted', 'deleted': deleted}), 200
        return jsonify({'error': 'Invalid index'}), 400
    return jsonify({'error': 'No reports found'}), 404

# ----------------- AI Chatbot Assistant -----------------
@app.route('/chat', methods=['POST'])
def chat():
    if not openai.api_key:
        return jsonify({"error": "OpenAI API key not set in backend"}), 500

    try:
        data = request.get_json(force=True)
        user_message = data.get("message", "")
        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        messages = [
            {"role": "system", "content": "You are a helpful AI assistant integrated into ScanX."},
            {"role": "user", "content": user_message}
        ]

        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            reply = response.choices[0].message.content
            return jsonify({"response": reply})

        except Exception as e:
            err_msg = str(e).lower()
            if "insufficient_quota" in err_msg:
                return jsonify({"error": "OpenAI quota exceeded. Try again later."}), 429
            elif "invalid_api_key" in err_msg:
                return jsonify({"error": "Invalid OpenAI API key"}), 401
            else:
                return jsonify({"error": f"OpenAI request failed: {str(e)}"}), 500

    except Exception as e:
        print(f"[CHAT ERROR] {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# ----------------- Run Flask -----------------
if __name__ == '__main__':
    app.run(debug=True)
