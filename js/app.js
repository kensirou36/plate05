// 設定
const CONFIG = {
    userId: 'user01',
    userName: localStorage.getItem('userName') || 'あなたの名前',
    gasUrl: 'https://script.google.com/macros/s/AKfycbx8ZwzQRijd3FIp8LVNdmZh5Y-zisgfRtiKNRZBHY7Xhi0Xl1AtLTxeQDv6Fmf6ySs/exec',
    lineToken: 'YOZ7UftinQaO3OyBDaloYu4cXzhYtLzmqBzAGNvCIJRg7h+DoqsX0n6OXdfOFZ9vI7/+VIOKgdWLHJ6yBmeAi6kPqz4+FZ3vpHQTBEAQSHA81c9tQLH/8oP8UUyRpnHxvmJ0QlaAjZWiraJeO38tBgdB04t89/1O/w1cDnyilFU=',
    groupId: 'C5a5b36e27a78ed6cfbb74839a8a9d04e'
};

// DOM要素
const elements = {
    currentTime: document.getElementById('currentTime'),
    userName: document.getElementById('userName'),
    statusCard: document.getElementById('statusCard'),
    clockInBtn: document.getElementById('clockInBtn'),
    clockOutBtn: document.getElementById('clockOutBtn'),
    recordContent: document.getElementById('recordContent'),
    toast: document.getElementById('toast'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeModal: document.getElementById('closeModal'),
    userNameInput: document.getElementById('userNameInput'),
    saveSettings: document.getElementById('saveSettings'),
    completionBtn: document.getElementById('completionBtn')
};

// 状態管理
let currentState = {
    isWorking: false,
    clockInTime: null,
    clockOutTime: null
};

// 初期化
function init() {
    // 初回起動時は設定モーダルを表示
    if (!localStorage.getItem('userName')) {
        showSettingsModal();
    }

    elements.userName.textContent = CONFIG.userName;
    updateClock();
    setInterval(updateClock, 1000);
    loadTodayRecord();
    setupEventListeners();

    // Service Worker登録
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }
}

// 時計更新
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    elements.currentTime.textContent = timeString;
}

// イベントリスナー設定
function setupEventListeners() {
    elements.clockInBtn.addEventListener('click', handleClockIn);
    elements.clockOutBtn.addEventListener('click', handleClockOut);

    // 設定モーダル
    elements.settingsBtn.addEventListener('click', showSettingsModal);
    elements.closeModal.addEventListener('click', hideSettingsModal);
    elements.saveSettings.addEventListener('click', saveUserSettings);

    // 課題完了ボタン
    elements.completionBtn.addEventListener('click', handleCompletion);

    // モーダル外クリックで閉じる
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            hideSettingsModal();
        }
    });
}

// 出勤処理
async function handleClockIn() {
    try {
        elements.clockInBtn.disabled = true;

        const now = new Date();
        const dateStr = formatDate(now);
        const timeStr = formatTime(now);

        // ローカルストレージに保存
        const record = {
            date: dateStr,
            userId: CONFIG.userId,
            userName: CONFIG.userName,
            clockInTime: timeStr,
            clockInTimestamp: now.toISOString()
        };

        localStorage.setItem('todayRecord', JSON.stringify(record));

        // 状態更新
        currentState.isWorking = true;
        currentState.clockInTime = timeStr;
        updateUI();

        // LINE通知送信
        await sendLineNotification('出勤', {
            userName: CONFIG.userName,
            time: timeStr,
            date: dateStr
        });

        // GASに送信（URLが設定されている場合）
        if (CONFIG.gasUrl) {
            await sendToGAS(record);
        }

        showToast('出勤を記録しました！', 'success');

    } catch (error) {
        console.error('出勤エラー:', error);
        showToast('エラーが発生しました', 'error');
        elements.clockInBtn.disabled = false;
    }
}

// 退勤処理
async function handleClockOut() {
    try {
        elements.clockOutBtn.disabled = true;

        const now = new Date();
        const timeStr = formatTime(now);

        // ローカルストレージから出勤記録を取得
        const recordStr = localStorage.getItem('todayRecord');
        if (!recordStr) {
            showToast('出勤記録が見つかりません', 'error');
            return;
        }

        const record = JSON.parse(recordStr);
        record.clockOutTime = timeStr;
        record.clockOutTimestamp = now.toISOString();

        // 勤務時間計算
        const workDuration = calculateWorkDuration(
            new Date(record.clockInTimestamp),
            new Date(record.clockOutTimestamp)
        );
        record.workDuration = workDuration;

        localStorage.setItem('todayRecord', JSON.stringify(record));

        // 状態更新
        currentState.isWorking = false;
        currentState.clockOutTime = timeStr;
        updateUI();

        // LINE通知送信
        await sendLineNotification('退勤', {
            userName: CONFIG.userName,
            clockInTime: record.clockInTime,
            clockOutTime: timeStr,
            workDuration: workDuration
        });

        // GASに送信（URLが設定されている場合）
        if (CONFIG.gasUrl) {
            await sendToGAS(record);
        }

        showToast('退勤を記録しました！', 'success');

    } catch (error) {
        console.error('退勤エラー:', error);
        showToast('エラーが発生しました', 'error');
        elements.clockOutBtn.disabled = false;
    }
}

// LINE通知送信
async function sendLineNotification(type, data) {
    let message = '';

    if (type === '出勤') {
        message = `【出勤】\n${data.userName}\n${data.date} ${data.time}`;
    } else if (type === '退勤') {
        message = `【退勤】\n${data.userName}\n出勤：${data.clockInTime}\n退勤：${data.clockOutTime}\n勤務：${data.workDuration}`;
    }

    try {
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.lineToken}`
            },
            body: JSON.stringify({
                to: CONFIG.groupId,
                messages: [{
                    type: 'text',
                    text: message
                }]
            })
        });

        if (!response.ok) {
            throw new Error('LINE通知の送信に失敗しました');
        }

        console.log('LINE通知送信成功');
    } catch (error) {
        console.error('LINE通知エラー:', error);
        // エラーでも処理は続行
    }
}

// GASにデータ送信
async function sendToGAS(data) {
    try {
        const response = await fetch(CONFIG.gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('GASにデータ送信成功');
    } catch (error) {
        console.error('GAS送信エラー:', error);
        // エラーでも処理は続行
    }
}

// UI更新
function updateUI() {
    const statusCard = elements.statusCard;
    const statusText = statusCard.querySelector('.status-text');
    const statusIcon = statusCard.querySelector('.status-icon');

    if (currentState.isWorking) {
        statusCard.classList.add('working');
        statusText.textContent = '勤務中';
        statusIcon.textContent = '💼';
        elements.clockInBtn.disabled = true;
        elements.clockOutBtn.disabled = false;
    } else {
        statusCard.classList.remove('working');
        statusText.textContent = '出勤前';
        statusIcon.textContent = '⏰';
        elements.clockInBtn.disabled = false;
        elements.clockOutBtn.disabled = true;
    }

    displayRecord();
}

// 本日の記録を読み込み
function loadTodayRecord() {
    const recordStr = localStorage.getItem('todayRecord');

    if (!recordStr) {
        elements.recordContent.innerHTML = '<p class="no-record">まだ記録がありません</p>';
        return;
    }

    const record = JSON.parse(recordStr);

    // 日付チェック
    const today = formatDate(new Date());
    if (record.date !== today) {
        localStorage.removeItem('todayRecord');
        elements.recordContent.innerHTML = '<p class="no-record">まだ記録がありません</p>';
        return;
    }

    // 状態を復元
    currentState.isWorking = record.clockInTime && !record.clockOutTime;
    currentState.clockInTime = record.clockInTime;
    currentState.clockOutTime = record.clockOutTime;

    // UI更新
    updateUI();
}

// 記録を表示
function displayRecord() {
    const recordStr = localStorage.getItem('todayRecord');

    if (!recordStr) {
        elements.recordContent.innerHTML = '<p class="no-record">まだ記録がありません</p>';
        return;
    }

    const record = JSON.parse(recordStr);

    // 日付チェック
    const today = formatDate(new Date());
    if (record.date !== today) {
        elements.recordContent.innerHTML = '<p class="no-record">まだ記録がありません</p>';
        return;
    }

    // 記録表示
    let html = '';
    html += `<div class="record-item"><span class="record-label">日付</span><span class="record-value">${record.date}</span></div>`;
    html += `<div class="record-item"><span class="record-label">出勤</span><span class="record-value">${record.clockInTime || '-'}</span></div>`;
    html += `<div class="record-item"><span class="record-label">退勤</span><span class="record-value">${record.clockOutTime || '-'}</span></div>`;
    if (record.workDuration) {
        html += `<div class="record-item"><span class="record-label">勤務時間</span><span class="record-value">${record.workDuration}</span></div>`;
    }

    elements.recordContent.innerHTML = html;
}

// 日付フォーマット
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 時刻フォーマット
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 勤務時間計算
function calculateWorkDuration(startTime, endTime) {
    const diff = endTime - startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}時間${minutes}分`;
}

// トースト表示
function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 設定モーダルを表示
function showSettingsModal() {
    elements.userNameInput.value = CONFIG.userName === 'あなたの名前' ? '' : CONFIG.userName;
    elements.settingsModal.classList.add('show');
}

// 設定モーダルを非表示
function hideSettingsModal() {
    // 初回起動時は名前が設定されるまで閉じられない
    if (!localStorage.getItem('userName')) {
        showToast('お名前を入力してください', 'error');
        return;
    }
    elements.settingsModal.classList.remove('show');
}

// ユーザー設定を保存
function saveUserSettings() {
    const userName = elements.userNameInput.value.trim();

    if (!userName) {
        showToast('お名前を入力してください', 'error');
        return;
    }

    // LocalStorageに保存
    localStorage.setItem('userName', userName);
    CONFIG.userName = userName;

    // UIを更新
    elements.userName.textContent = userName;

    // モーダルを閉じる
    elements.settingsModal.classList.remove('show');

    showToast('設定を保存しました');
}

// 課題完了報告処理
async function handleCompletion() {
    try {
        elements.completionBtn.disabled = true;

        const now = new Date();
        const completionData = {
            type: 'completion',
            completedAt: now.toLocaleString('ja-JP'),
            userId: CONFIG.userId,
            userName: CONFIG.userName,
            appUrl: window.location.href
        };

        // GASに送信
        if (CONFIG.gasUrl) {
            await sendToGAS(completionData);
            showToast('🎉 課題完了報告を送信しました！', 'success');
        } else {
            showToast('GAS URLが設定されていません', 'error');
        }

    } catch (error) {
        console.error('課題完了エラー:', error);
        showToast('送信に失敗しました', 'error');
    } finally {
        elements.completionBtn.disabled = false;
    }
}

// アプリ起動
init();
