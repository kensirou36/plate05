// Google Apps Script for Attendance App
// このコードをGoogle Apps Scriptエディタにコピーしてください

// スクリプトプロパティから設定を取得
function getProperty(key) {
  const properties = PropertiesService.getScriptProperties();
  return properties.getProperty(key);
}

// 設定値を取得（プロパティが未設定の場合はエラー）
const SPREADSHEET_ID = getProperty('SPREADSHEET_ID');
const LINE_TOKEN = getProperty('LINE_TOKEN');
const GROUP_ID = getProperty('GROUP_ID');

// POSTリクエストを受け取る
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // データタイプに応じて処理を分岐
    if (data.type === 'completion') {
      // 課題完了報告
      recordCompletion(data);
      sendCompletionNotification(data);
    } else {
      // 出退勤記録
      recordAttendance(data);
      sendLineNotification(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: '記録しました'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('エラー: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// スプレッドシートに記録
function recordAttendance(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('打刻記録');
  
  if (!sheet) {
    throw new Error('打刻記録シートが見つかりません');
  }
  
  // 既存の記録を検索
  const lastRow = sheet.getLastRow();
  let recordRow = null;
  
  for (let i = 2; i <= lastRow; i++) {
    const rowDate = sheet.getRange(i, 1).getValue();
    const rowUserId = sheet.getRange(i, 2).getValue();
    
    if (rowDate === data.date && rowUserId === data.userId) {
      recordRow = i;
      break;
    }
  }
  
  if (recordRow) {
    // 既存の記録を更新（退勤の場合）
    if (data.clockOutTime) {
      sheet.getRange(recordRow, 5).setValue(data.clockOutTime);
      sheet.getRange(recordRow, 6).setValue(data.workDuration);
    }
  } else {
    // 新しい記録を追加（出勤の場合）
    sheet.appendRow([
      data.date,
      data.userId,
      data.userName,
      data.clockInTime,
      data.clockOutTime || '',
      data.workDuration || ''
    ]);
  }
}

// LINE通知送信
function sendLineNotification(data) {
  // dataが存在しない、またはclockOutTimeプロパティがない場合の安全なチェック
  if (!data) {
    Logger.log('LINE通知: データが空です');
    return;
  }
  
  let message = '';
  
  if (data.clockOutTime) {
    // 退勤通知
    message = `【退勤】\n${data.userName}\n出勤：${data.clockInTime}\n退勤：${data.clockOutTime}\n勤務：${data.workDuration}`;
  } else if (data.clockInTime) {
    // 出勤通知
    message = `【出勤】\n${data.userName}\n${data.date} ${data.clockInTime}`;
  } else {
    Logger.log('LINE通知: 出退勤データではありません');
    return;
  }
  
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: GROUP_ID,
    messages: [{
      type: 'text',
      text: message
    }]
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_TOKEN
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(url, options);
    Logger.log('LINE通知送信成功');
  } catch (error) {
    Logger.log('LINE通知エラー: ' + error);
  }
}

// 課題完了記録
function recordCompletion(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('課題完了記録');
  
  if (!sheet) {
    throw new Error('課題完了記録シートが見つかりません');
  }
  
  // 新しい記録を追加
  sheet.appendRow([
    data.completedAt,
    data.userId,
    data.userName,
    data.appUrl,
    '確認待ち'
  ]);
}

// 課題完了通知送信
function sendCompletionNotification(data) {
  const message = `【🎉課題完了報告🎉】\n研修生：${data.userName}（${data.userId}）\n完了：${data.completedAt}\n\nアプリURL:\n${data.appUrl}\n\n確認をお願いします！`;
  
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: GROUP_ID,
    messages: [{
      type: 'text',
      text: message
    }]
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_TOKEN
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(url, options);
    Logger.log('課題完了通知送信成功');
  } catch (error) {
    Logger.log('課題完了通知エラー: ' + error);
  }
}

// テスト用関数
function testPost() {
  const testData = {
    date: '2026/01/10',
    userId: 'user01',
    userName: 'あなたの名前',
    clockInTime: '09:00',
    clockInTimestamp: new Date().toISOString()
  };
  
  recordAttendance(testData);
  sendLineNotification(testData);
  Logger.log('テスト完了');
}

// 初期設定用関数（初回のみ実行）
function setupProperties() {
  const properties = PropertiesService.getScriptProperties();
  
  // 以下の値を実際の値に置き換えてから実行してください
  properties.setProperties({
    'SPREADSHEET_ID': 'YOUR_SPREADSHEET_ID_HERE',
    'LINE_TOKEN': 'YOZ7UftinQaO3OyBDaloYu4cXzhYtLzmqBzAGNvCIJRg7h+DoqsX0n6OXdfOFZ9vI7/+VIOKgdWLHJ6yBmeAi6kPqz4+FZ3vpHQTBEAQSHA81c9tQLH/8oP8UUyRpnHxvmJ0QlaAjZWiraJeO38tBgdB04t89/1O/w1cDnyilFU=',
    'GROUP_ID': 'C5a5b36e27a78ed6cfbb74839a8a9d04e'
  });
  
  Logger.log('プロパティの設定が完了しました');
  Logger.log('SPREADSHEET_ID: ' + properties.getProperty('SPREADSHEET_ID'));
  Logger.log('LINE_TOKEN: ' + (properties.getProperty('LINE_TOKEN') ? '設定済み' : '未設定'));
  Logger.log('GROUP_ID: ' + properties.getProperty('GROUP_ID'));
}

// 現在のプロパティ設定を確認する関数
function checkProperties() {
  const properties = PropertiesService.getScriptProperties();
  const allProperties = properties.getProperties();
  
  Logger.log('=== 現在のプロパティ設定 ===');
  Logger.log('SPREADSHEET_ID: ' + (allProperties.SPREADSHEET_ID || '未設定'));
  Logger.log('LINE_TOKEN: ' + (allProperties.LINE_TOKEN ? '設定済み（' + allProperties.LINE_TOKEN.substring(0, 10) + '...）' : '未設定'));
  Logger.log('GROUP_ID: ' + (allProperties.GROUP_ID || '未設定'));
  
  return allProperties;
}
