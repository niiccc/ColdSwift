from flask import Flask, request, jsonify
from Final_Face_Model import extract_face_info
import os
import json

app = Flask(__name__)

@app.route('/extract-face', methods=['POST'])
def extract_face():
    if 'face_image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files['face_image']
    if image_file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    image_path = "/tmp/" + image_file.filename
    os.makedirs(os.path.dirname(image_path), exist_ok=True)
    image_file.save(image_path)

    try:
        result = extract_face_info(image_path)
        result_dict = json.loads(result)
        return jsonify(result_dict)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)