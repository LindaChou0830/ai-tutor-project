document.addEventListener('DOMContentLoaded', () => {
    // 修正 ID 以匹配 index.html
    const userQuestionInput = document.getElementById('questionInput');
    const submitButton = document.getElementById('askButton');
    const aiResponseArea = document.getElementById('responseOutput');
    // loadingSpinner 在當前 HTML 和 CSS 中沒有明確 ID，這裡先註釋掉，如果你想加可以再定義
    // const loadingSpinner = document.getElementById('loading-spinner'); 
    const errorMessage = document.getElementById('errorDisplay');

    // 由于不再有 .inspiration-button，这行可以移除或注释掉
    // const inspirationButtons = document.querySelectorAll('.inspiration-button');

    // AI 導師的角色提示詞 (這裡只是前端展示，實際應用中會由後端處理)
    const AI_PROMPT = `你是一位專精於社會科學問卷研究的 AI 導師。使用者將會針對問卷研究的不同階段提出問題。請你以簡潔、清晰且具引導性的方式回答，並鼓勵使用者深入思考。你的回答應針對問卷研究的特定主題，例如構念化、操作化、題目設計、抽樣方法、數據分析等。如果問題超出問卷研究範疇，請禮貌地告知你專注於問卷研究。`;

    // 修正後端 API 端點，加上 /ask_ai 路徑
    const BACKEND_API_ENDPOINT = 'https://my-ai-tutor.onrender.com/ask_ai'; // *** 這是你的實際後端 API URL，加上了 /ask_ai ***

    // 檢查元素是否存在，避免 TypeError
    if (submitButton && userQuestionInput && aiResponseArea && errorMessage) {
        submitButton.addEventListener('click', async () => {
            const question = userQuestionInput.value.trim();

            if (!question) {
                errorMessage.textContent = '請輸入您的問題！';
                errorMessage.style.display = 'block';
                aiResponseArea.textContent = '';
                return;
            }

            errorMessage.style.display = 'none';
            aiResponseArea.textContent = 'AI 導師思考中...'; // 顯示一個載入提示
            // 如果你未來加入了 loading-spinner，可以在這裡顯示
            // if (loadingSpinner) loadingSpinner.style.display = 'block';
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
                aiResponseArea.textContent = '無法獲取回覆。'; // 錯誤時顯示提示
            } finally {
                // if (loadingSpinner) loadingSpinner.style.display = 'none';
                submitButton.disabled = false;
            }
        });
    } else {
        // 如果有任何元素未找到，在控制台打印錯誤，幫助調試
        console.error("錯誤：部分 HTML 元素未找到。請檢查 ID 是否匹配：questionInput, askButton, responseOutput, errorDisplay");
    }

    // 由於已經移除了頁面上的「尋找靈感」按鈕，這段代碼可以安全移除或註釋掉
    /*
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
    */
});