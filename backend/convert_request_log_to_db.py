# %%
import re
import re
import psycopg2
from datetime import datetime
import json
import ipaddress
# %%
conn = psycopg2.connect(
    host="127.0.0.1",
    port=5432,
    dbname="web_logs_db",
    user="yining_juan",
)
# %%
cur = conn.cursor()
# %%
insert_sql = """
INSERT INTO custodiai.api_usage_logs
(timestamp, ip, endpoint, model_used, data_payload, user_agent, message)
VALUES (%s, %s, %s, %s, %s, %s, %s)
"""
# %%
ts_pattern = re.compile(r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})')
ip_pattern = re.compile(r'Client IP:\s*(.*)')
useragent_pattern = re.compile(r'User-Agent:\s*(.*)')
get_predict_pattern = re.compile(r'Get predict result:\s*(mode\d+)')
# %%
def parse_timestamp(line):
    m = ts_pattern.match(line)
    if m:
        dt_str = m.group(1)  # e.g. "2024-07-30 20:03:09,888"
        return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S,%f")
    return None
# %%
current_dt = None
current_ip = None
current_endpoint = None
current_model = None
current_data = None
current_ua = None
current_msg = None
def insert_record():
    if current_dt and current_ip:  # 至少要有 timestamp, ip
            try:
                cur.execute(
                    insert_sql,
                    (
                        current_dt,
                        current_ip,
                        current_endpoint if current_endpoint else '',
                        current_model if current_model else '',
                        json.dumps(current_data) if current_data else '{}',
                        current_ua if current_ua else '',
                        json.dumps(current_msg) if current_msg else '[]',
                    )
                )
            except Exception as e:
                print("Insertion error!", e)
                print("Error with IP:", current_ip)
                # 你也可以想要印出更多東西
                print("Endpoint:", current_endpoint)
                print("Model used:", current_model)
                print("data_payload:", current_data)
                print("message:", current_msg)
                # 再次拋出錯誤或直接通過
                raise
# FIXME
# MAX_LINES = 50
# line_count = 0
def get_valid_ip(raw_ip):
    # 分割逗號取第一個
    candidate = raw_ip.split(',')[0].strip()
    try:
        # 嘗試解析 candidate 為合法的 IP
        ipaddress.ip_address(candidate)
        return candidate
    except ValueError:
        # 若不合法，可以選擇回傳空字串，或找其他合法的 IP（例如逗號後的第二個）
        parts = [part.strip() for part in raw_ip.split(',')]
        for part in parts:
            try:
                ipaddress.ip_address(part)
                return part
            except ValueError:
                continue
        return ''  # 若都不合法，就回傳空字串
with open("backend/flask_requests.log", "r", encoding="utf-8") as f:
    for line in f:
        line = line.rstrip('\n')
        # 1) 嘗試抓 timestamp
        dt = parse_timestamp(line)
        # 若又見到新的 timestamp，且已經出現 "Client IP" => 代表上一筆記錄結束
        if dt:
            # 你可以選擇: 如果 dt != current_dt，先 insert，再重設
            # 不過多數情況 "Client IP" 行也帶 timestamp
            # let's not insert here yet
            pass

        # 2) 檢查是否有 "Client IP:"
        m_ip = ip_pattern.search(line)
        if m_ip:
            insert_record()
            
            current_dt = dt if dt else None
            raw_ip = m_ip.group(1).strip()
            current_ip = get_valid_ip(raw_ip)
            
            current_endpoint = None
            current_model = None
            current_data = None
            current_ua = None
            current_msg = None
            continue

        # 3) endpoint判斷:
        #    - "Send Message To OpenAI." => endpoint = "/api/send-messages"
        if "Send Message To OpenAI." in line:
            current_endpoint = "/api/send-messages"
        elif "Get predict result:" in line:
            current_endpoint = "/api/intermediate-predict"
            # 另抓 model
            m_model = get_predict_pattern.search(line)
            if m_model:
                current_model = m_model.group(1)  # e.g. "mode1"

        # 4) user-agent
        ua_match = useragent_pattern.search(line)
        if ua_match:
            current_ua = ua_match.group(1).strip()

        # 5) 其他欄位，如 "Request Body"
        if "Request Body:" in line:
            parts = line.split("Request Body:", 1)
            if len(parts) == 2:
                body_str = parts[1].strip()
                try:
                    body_dict = json.loads(body_str)  # 嘗試把後面 parse 成 dict
                except json.JSONDecodeError:
                    # 如果 parse 失敗就略過或做其他處理
                    body_dict = {}
                
                # 如果 parse 成功 (body_dict是一個dict)
                if isinstance(body_dict, dict):
                    # 如果裡面有 messages key，且是 list，取最後一個元素當作 current_msg
                    if 'messages' in body_dict and isinstance(body_dict['messages'], list):
                        if body_dict['messages']:  # 不是空清單
                            current_msg = body_dict['messages'][-1]  # 取最後一個 item
                        else:
                            current_msg = None

                    # 如果裡面有 data key，就把 data 存到 current_data
                    if 'data' in body_dict:
                        current_data = body_dict['data']
# %%
insert_record()
# %%
conn.commit()
cur.close()
conn.close()
# %%
# 顯示剛剛加入的 records:

# %%
select_sql = """
SELECT id, timestamp, ip, endpoint, model_used, data_payload, user_agent, message 
FROM custodiai.api_usage_logs
"""
cur.execute(select_sql)
rows = cur.fetchall()

for row in rows:
    id, timestamp, ip, endpoint, model_used, data_payload, user_agent, message = row

    # 嘗試格式化 data_payload，如果它是 JSON 字串
    try:
        data_payload_pretty = json.dumps(json.loads(data_payload), ensure_ascii=False)
    except Exception:
        data_payload_pretty = data_payload

    # 嘗試格式化 message
    try:
        message_pretty = json.dumps(json.loads(message), ensure_ascii=False)
    except Exception:
        message_pretty = message

    # 用 f-string 印出各欄位，避免使用 repr() 的預設行為
    print(f"ID: {id}")
    print(f"Timestamp: {timestamp}")
    print(f"IP: {ip}")
    print(f"Endpoint: {endpoint}")
    print(f"Model: {model_used}")
    print(f"Data Payload: {data_payload_pretty}")
    print(f"User Agent: {user_agent}")
    print(f"Message: {message_pretty}")
    print("-" * 40)