document.addEventListener('DOMContentLoaded', () => {
    const userQuestionInput = document.getElementById('user-question');
    const submitButton = document.getElementById('submit-button');
    const aiResponseArea = document.getElementById('ai-response-area');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const inspirationButtons = document.querySelectorAll('.inspiration-button');

    // AI 導師的角色提示詞 (這裡只是前端展示，實際應用中會由後端處理)
    const AI_PROMPT = `你是一位專精於社會科學問卷研究的 AI 導師。使用者將會針對問卷研究的不同階段提出問題。請你以簡潔、清晰且具引導性的方式回答，並鼓勵使用者深入思考。你的回答應針對問卷研究的特定主題，例如構念化、操作化、題目設計、抽樣方法、數據分析等。如果問題超出問卷研究範疇，請禮貌地告知你專注於問卷研究。`;

    // 這裡需要替換成你的後端 API 端點
    // 例如：如果你用 Flask 部署在本地，可能是 'http://127.0.0.1:5000/ask_ai'
    // 如果部署在 Heroku/Render 等平台，會是一個公共 URL
    const BACKEND_API_ENDPOINT = 'http://localhost:5000/ask_ai'; // *** 請替換為你的實際後端 API URL ***

    submitButton.addEventListener('click', async () => {
        const question = userQuestionInput.value.trim();

        if (!question) {
            errorMessage.textContent = '請輸入您的問題！';
            errorMessage.style.display = 'block';
            aiResponseArea.textContent = '';
            return;
        }

        errorMessage.style.display = 'none';
        aiResponseArea.textContent = '';
        loadingSpinner.style.display = 'block';
        submitButton.disabled = true; // 防止重複點擊

        try {
            const response = await fetch(BACKEND_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: question,
                    system_instruction: AI_PROMPT // 將 AI_PROMPT 傳給後端
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            aiResponseArea.textContent = data.reply; // 假設後端返回的 JSON 中有 'reply' 字段

        } catch (error) {
            console.error('Error fetching AI response:', error);
            errorMessage.textContent = `發生錯誤：${error.message}。請檢查後端服務是否運行正常。`;
            errorMessage.style.display = 'block';
        } finally {
            loadingSpinner.style.display = 'none';
            submitButton.disabled = false;
        }
    });

    // 為所有「尋找靈感」按鈕添加點擊事件
    inspirationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const topicCard = button.closest('.topic-card');
            if (topicCard) {
                const topicTitle = topicCard.querySelector('h3').textContent;
                userQuestionInput.value = `關於「${topicTitle}」這個主題，我應該從哪些方面進行深入研究或思考？`;
                // 可以選擇性地自動觸發送出按鈕
                // submitButton.click();
            }
        });
    });
});