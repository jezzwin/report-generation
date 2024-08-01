from flask import Flask, jsonify, request
import uuid
import time
import json
import sqlite3
from flask_cors import CORS
from threading import Timer
import os

app = Flask(__name__)
CORS(app)

reports = {}
REPORT_READY_TIME = 60
DATABASE_PATH = 'database1.db'
RESPONSE_FILE_PATH = 'response.json'

@app.route('/generate', methods=['GET'])
def generate_report():
    report_id = str(uuid.uuid4())
    reports[report_id] = 'PENDING'
    Timer(REPORT_READY_TIME, make_report_ready, [report_id]).start()
    return jsonify(reportId=report_id)

@app.route('/download', methods=['POST'])
def download_report():
    report_id = request.json.get('reportId')
    status = reports.get(report_id, 'PENDING')

    if status == 'PENDING':
        return jsonify(status='PENDING')
    
    try:
        data = transform_data()
        return jsonify(status='READY', data=data)
    except Exception as e:
        return jsonify(error=str(e)), 500

def make_report_ready(report_id):
    reports[report_id] = 'READY'

def transform_data():
    if not os.path.exists(RESPONSE_FILE_PATH):
        raise FileNotFoundError(f"{RESPONSE_FILE_PATH} not found")
    
    with open(RESPONSE_FILE_PATH) as f:
        data = json.load(f)['data']

    if not os.path.exists(DATABASE_PATH):
        open(DATABASE_PATH, 'w').close()
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS report_data (
            id INTEGER PRIMARY KEY,
            sales INTEGER,
            purchases INTEGER,
            asin TEXT,
            date TEXT
        )
    ''')

    try:
        cursor.executemany('''
            INSERT INTO report_data (id, sales, purchases, asin, date)
            VALUES (?, ?, ?, ?, ?)
        ''', [(d['id'], d['sales'], d['purchases'], d['asin'], d['date']) for d in data])
        conn.commit()
    except sqlite3.IntegrityError as e:
        print(f"Integrity error: {e}")

    cursor.execute('''
        SELECT asin, SUM(sales) AS total_sales, SUM(purchases) AS total_purchases
        FROM report_data
        GROUP BY asin
    ''')

    result = cursor.fetchall()
    conn.close()

    return [{'asin': row[0], 'total_sales': row[1], 'total_purchases': row[2]} for row in result]

if __name__ == '__main__':
    app.run(debug=True)
