"""Flask 后端 API 服务"""

import os
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from docuforge.converter import convert, SUPPORTED_FORMATS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
OUTPUT_DIR = os.path.join(BASE_DIR, 'outputs')
HISTORY_FILE = os.path.join(BASE_DIR, 'history.json')

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


def load_history():
    if os.path.isfile(HISTORY_FILE):
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('tasks', [])
    return []


def save_history(tasks):
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump({'tasks': tasks}, f, ensure_ascii=False, indent=2)


def add_history_item(item):
    tasks = load_history()
    tasks.insert(0, item)
    if len(tasks) > 10:
        tasks = tasks[:10]
    save_history(tasks)


@app.route('/api/convert', methods=['POST'])
def convert_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': '未找到文件'}), 400

    file = request.files['file']
    target_format = request.form.get('targetFormat', '')

    if not file.filename:
        return jsonify({'success': False, 'error': '文件名为空'}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_FORMATS:
        return jsonify({'success': False, 'error': f'不支持的格式: {ext}'}), 400

    if target_format not in SUPPORTED_FORMATS:
        return jsonify({'success': False, 'error': f'不支持的目标格式: {target_format}'}), 400

    if ext == target_format:
        return jsonify({'success': False, 'error': '源格式和目标格式相同'}), 400

    task_id = str(uuid.uuid4())
    safe_name = secure_filename(file.filename)
    upload_path = os.path.join(UPLOAD_DIR, f"{task_id}_{safe_name}")
    file.save(upload_path)

    result_name = os.path.splitext(safe_name)[0] + target_format
    output_path = os.path.join(OUTPUT_DIR, f"{task_id}_{result_name}")

    try:
        convert(upload_path, output_path)
        add_history_item({
            'id': task_id,
            'sourceFile': safe_name,
            'targetFormat': target_format,
            'resultFile': f"{task_id}_{result_name}",
            'status': 'success',
            'timestamp': datetime.now().isoformat(),
            'error': None,
        })
        return jsonify({
            'success': True,
            'taskId': task_id,
            'resultFile': f"{task_id}_{result_name}",
            'message': '转换成功',
        })
    except Exception as e:
        add_history_item({
            'id': task_id,
            'sourceFile': safe_name,
            'targetFormat': target_format,
            'resultFile': '',
            'status': 'failed',
            'timestamp': datetime.now().isoformat(),
            'error': str(e),
        })
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    safe_name = secure_filename(filename)
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    if not os.path.isfile(file_path):
        return jsonify({'success': False, 'error': '文件不存在'}), 404
    original_name = '_'.join(safe_name.split('_')[1:])
    return send_file(file_path, as_attachment=True, download_name=original_name)


@app.route('/api/history', methods=['GET'])
def get_history():
    tasks = load_history()
    return jsonify({'success': True, 'data': tasks})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
