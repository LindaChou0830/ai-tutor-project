# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import sys

app = Flask(__name__)
CORS(app) # 允許跨域請求

# =========================================================
# *** API Key 獲取策略 ***
# =========================================================

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# ====== 診斷信息：打印實際讀取到的 API Key ======
if GEMINI_API_KEY:
    print(f"DEBUG: 從環境變數讀取的 GEMINI_API_KEY (完整值): {GEMINI_API_KEY}")
else:
    print("DEBUG: GEMINI_API_KEY 環境變數未設置。")
# ===============================================

if not GEMINI_API_KEY:
    print("錯誤：GEMINI_API_KEY 環境變數未設置。請確保已正確設置。", file=sys.stderr)
    sys.exit("應用程式啟動失敗：GEMINI_API_KEY 未設置。")
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)

        # ====== 診斷信息：列出所有可用的模型 ======
        print("DEBUG: 嘗試列出可用模型...")
        available_models = []
        for m in genai.list_models():
            if "generateContent" in m.supported_generation_methods:
                available_models.append(m.name)
        if available_models:
            print(f"DEBUG: 帳號下可用的模型 (支援 generateContent): {available_models}")
        else:
            print("DEBUG: 未找到任何支援 generateContent 的可用模型。")
        # ==========================================

        # ==== 修改後的模型測試邏輯 ====
        # 直接嘗試使用推薦的 gemini-1.5-flash-latest
        target_model = 'gemini-1.5-flash-latest'
        if f'models/{target_model}' in available_models:
            print(f"DEBUG: 正在使用推薦模型 '{target_model}' 進行啟動測試。")
            test_model = genai.GenerativeModel(target_model)
            test_response = test_model.generate_content(
                "測試連接",
                safety_settings=[{"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}]
            )
            print("Gemini 模型已初始化並通過基本連接測試。")
        else:
            # 如果推薦模型不在可用列表中，則提示錯誤並退出
            print(f"錯誤：推薦模型 '{target_model}' 不在可用模型列表中。請考慮選擇其他可用模型。", file=sys.stderr)
            if available_models:
                print(f"DEBUG: 可用模型包括: {available_models}", file=sys.stderr)
            sys.exit(f"應用程式啟動失敗：模型 '{target_model}' 無法使用。")
        # =============================

        AI_PROMPT = """你是一位專精於社會科學問卷研究的 AI 導師。使用者將會針對問卷研究的不同階段提出問題。請你以簡潔、清晰且具引導性的方式回答，並鼓勵使用者深入思考。你的回答應針對問卷研究的特定主題，例如構念化、操作化、題目設計、抽樣方法、數據分析等。如果問題超出問卷研究範疇，請禮貌地告知你專注於問卷研究。
        """
        # 確保這裡使用的模型名稱與成功測試的模型一致
        model = genai.GenerativeModel('gemini-1.5-flash-latest', system_instruction=AI_PROMPT) 

    except Exception as e:
        print(f"錯誤：Gemini API Key 配置或連接失敗。詳細錯誤: {e}", file=sys.stderr)
        print("請檢查你的 API Key 是否有效且正確。應用程式將退出。", file=sys.stderr)
        sys.exit(f"應用程式啟動失敗：Gemini API Key 無效或連接問題。錯誤: {e}")

@app.route('/ask_ai', methods=['POST'])
def ask_ai():
    if not GEMINI_API_KEY:
        return jsonify({"error": "API Key 未設置，無法提供服務。請聯繫管理員。"}), 500

    data = request.get_json()
    question = data.get('question')
    system_instruction = data.get('system_instruction', AI_PROMPT)

    if not question:
        return jsonify({"error": "請提供問題。"}), 400

    try:
        current_model = genai.GenerativeModel(
            'gemini-1.5-flash-latest', # 確保這裡也是 'gemini-1.5-flash-latest'
            system_instruction=system_instruction
        )
        response = current_model.generate_content(
            question,
            safety_settings=[{"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}]
        )
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"後端處理請求時發生錯誤: {e}", file=sys.stderr)
        return jsonify({"error": f"AI 回覆生成失敗：{e}"}), 500

if __name__ == '__main__':
    print("正在啟動 Flask 應用程式...")
    app.run(debug=True, port=5000)