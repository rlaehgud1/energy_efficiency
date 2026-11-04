import os
import sys
import json
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

# 프로젝트 최상위 루트 디렉토리(ENERGY_EFFICIENCY-MAIN) 계산
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)) # .../api
BASE_DIR = os.path.dirname(CURRENT_DIR)                 # .../ENERGY_EFFICIENCY-MAIN

# sys.path에 루트 및 scripts 경로 우선 등록
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
SCRIPTS_DIR = os.path.join(BASE_DIR, 'scripts')
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "ResStock API Server Running"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("\n📥 [요청 데이터 수신]:", data)

        # 1. resstock_predict 모듈 로드 시도
        try:
            import resstock_predict
            InputError = getattr(resstock_predict, 'InputError', Exception)
        except (ImportError, AttributeError) as ie:
            # resstock_predict 로드 실패 시 lambda_function 백업 실행
            print("⚠️ resstock_predict 실패, lambda_function 시도:", ie)
            import lambda_function
            event = {"body": json.dumps(data)}
            response = lambda_function.lambda_handler(event, None)
            body = json.loads(response['body']) if isinstance(response['body'], str) else response['body']
            return jsonify(body), response.get('statusCode', 200)

        # 2. 정상 로드된 경우 예측 수행 및 InputError 처리
        try:
            mode = data.get('mode', 'simple')
            models_dir = os.path.join(BASE_DIR, 'models')
            
            art = resstock_predict.load_artifact(mode, models_dir=models_dir)
            result = resstock_predict.predict(art, data)
            return jsonify(result), 200

        except InputError as ie:
            # 입력값 검증 실패 (400)
            print("⚠️ 입력값 검증 오류:", ie)
            return jsonify({"error": str(ie)}), 400

    except Exception as e:
        print("\n❌ [PREDICT ERROR TRACEBACK]:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("==================================================")
    print("🚀 ResStock 지원 API 서버가 http://127.0.0.1:8000 에서 실행 중입니다.")
    print("==================================================")
    app.run(host='127.0.0.1', port=8000, debug=True)