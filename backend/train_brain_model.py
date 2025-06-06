from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import json
from datetime import datetime
import openai
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# --- OpenAI API Key ---
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- Report File Path ---
REPORTS_FILE = 'patient_reports.json'

# --- Save Report to JSON File ---
def save_report(report):
    if os.path.exists(REPORTS_FILE):
        with open(REPORTS_FILE, 'r') as f:
            data = json.load(f)
    else:
        data = []
    data.append(report)
    with open(REPORTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "https://scanx-j3l0.onrender.com"
]}})

# --- Paths to Models ---
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, "models", "chest_xray_model.h5")
model2_path = os.path.join(base_dir, "models", "brain_tumor_model.h5")

# --- Ensure Uploads Directory Exists ---
os.makedirs("uploads", exist_ok=True)

# --- Load models once globally ---
chest_model = load_model(model_path)
brain_model = load_model(model2_path)

# --- Home Route ---
@app.route('/')
def index():
    return jsonify({'message': 'ScanX API is running'})

# ---------- Chest X-ray Prediction ----------
@app.route('/predict/chest', methods=['POST'])
def predict_chest():
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
        prediction = chest_model.predict(img)[0]
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

        # Optionally delete uploaded image to save disk space
        os.remove(img_path)

        return jsonify({'Result': label, 'confidence': round(float(confidence) * 100, 2)})
    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

# ---------- Brain Tumor MRI Prediction ----------
@app.route('/predict/brain', methods=['POST'])
def predict_brain():
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
        prediction = brain_model.predict(img)[0]
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

        # Optionally delete uploaded image to save disk space
        os.remove(img_path)

        return jsonify({'Result': predicted_class, 'confidence': round(confidence * 100, 2)})
    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

# ---------- Fetch Reports ----------
@app.route('/reports', methods=['GET'])
def get_reports():
    if os.path.exists(REPORTS_FILE):
        with open(REPORTS_FILE, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify([])

# ---------- Delete Report by Index ----------
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
        else:
            return jsonify({'error': 'Invalid index'}), 400
    else:
        return jsonify({'error': 'No reports found'}), 404

# ---------- AI Chatbot Assistant ----------
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({'error': 'Empty message'}), 400

        messages = [
            {"role": "system", "content": "You are a helpful AI assistant integrated into ScanX. You answer FAQs about ScanX features, explain scan reports, guide patients to doctors, and provide medical tips for chest X-rays and brain MRIs."},
            {"role": "user", "content": user_message}
        ]

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )

        reply = response.choices[0].message['content']
        return jsonify({'response': reply})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------- Run the App ----------
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
