from flask import Flask, request, jsonify
from model_ktp_ocr import extract_ktp_info
import os
import json

app = Flask(__name__)

@app.route('/extract', methods=['POST'])
def extract():
    if 'ktp_image' not in request.files:
        return jsonify(error="No file part"), 400

    file = request.files['ktp_image']
    if file.filename == '':
        return jsonify(error="No selected file"), 400

    image_path = "/tmp/" + file.filename
    os.makedirs(os.path.dirname(image_path), exist_ok=True)
    file.save(image_path)

    try:
        result = extract_ktp_info(image_path)
        result_dict = json.loads(result)
        return jsonify(result_dict)
    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)