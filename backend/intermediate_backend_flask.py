# %%
import pickle
from flask import Flask, request, render_template, jsonify, make_response, send_file, Response
import os
from flask_cors import CORS, cross_origin
import random
import requests
import pandas as pd
import tempfile
import shutil
import openai
import logging
from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import func, case
import re
import ipaddress
openai.api_key = os.getenv('OPENAI_KEY')

# %%
# For CORS Protocal
app = Flask(__name__,
            static_folder="../dist/assets",
            template_folder="../dist")
CORS(app)
# %%
# 和 DB 有關的設定
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://yining_juan@127.0.0.1:5432/web_logs_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
class ApiUsageLog(db.Model):
    __tablename__ = 'api_usage_logs'
    __table_args__ = {'schema': 'custodiai'}

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False)
    ip = db.Column(db.String(45), nullable=False)
    endpoint = db.Column(db.String(255), nullable=False)
    model_used = db.Column(db.String(50))
    data_payload = db.Column(JSONB)  # 使用 PostgreSQL JSONB
    message = db.Column(JSONB)       # 也可以視情況使用 JSON
    user_agent = db.Column(db.Text)

@app.before_request
def create_tables():
    db.create_all()
# %%
def validate_ip(ip_str):
    try:
        # 嘗試解析，如果合法就返回 True
        ipaddress.ip_address(ip_str)
        return True
    except ValueError:
        return False
    
def get_client_ip_and_user_agent():
    if request.headers.get("X-Forwarded-For"):
        ip_str = request.headers.get("X-Forwarded-For")
        # 取出第一個，並檢查是否為合法 IP
        candidate = ip_str.split(",")[0].strip()
        if validate_ip(candidate):
            ip = candidate
        else:
            # 如果不合法，嘗試找下一個
            parts = [part.strip() for part in ip_str.split(",")]
            ip = next((part for part in parts if validate_ip(part)), candidate)
    elif request.headers.get("X-Real-IP"):
        ip = request.headers.get("X-Real-IP")
    else:
        ip = request.remote_addr

    user_agent = request.headers.get("User-Agent", "")
    return ip, user_agent

# %%
'''
Interface...
'''

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template("index.html")

@app.route('/api/random')
def random_number():
    print('>>>Hi!')
    response = {
        'randomNumber': random.randint(1, 100)
    }
    return jsonify(response)



# %%

if __name__ == "__main__":
        port = int(os.environ.get("PORT", 8080))
    #    app.run(host='0.0.0.0', port=port, debug=True, ssl_context=('cert.pem', 'key.pem'))
        app.run(host='0.0.0.0', port=port, debug=True, threaded=True)
