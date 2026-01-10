# 出退勤管理アプリ

スマートフォンからワンタップで出退勤を打刻し、管理者のLINEグループに自動通知するPWAアプリです。

## 機能

### 実装済み
- ✅ 出勤打刻（ボタン押下でLINE通知）
- ✅ 退勤打刻（勤務時間自動計算）
- ✅ ローカルストレージでのデータ保存
- ✅ PWA対応（スマホのホーム画面に追加可能）
- ✅ リアルタイム時計表示
- ✅ 本日の記録表示

### 今後実装予定
- ⏳ Google Spreadsheet連携
- ⏳ 課題完了報告機能
- ⏳ GitHub Pagesへのデプロイ

## セットアップ

### 1. ローカルで動作確認

```powershell
cd C:\Users\本山　拓弥\.gemini\antigravity\scratch\attendance-app
python -m http.server 8000
```

ブラウザで `http://localhost:8000` にアクセス

### 2. Google Apps Scriptの設定（次のステップ）

1. Google Driveで新しいスプレッドシートを作成
2. 以下のシート構成を作成：
   - シート1: 研修生マスタ
   - シート2: 打刻記録
   - シート3: 課題完了記録
3. Apps Scriptエディタを開く（拡張機能 > Apps Script）
4. GASコードを実装
5. Web Appとしてデプロイ
6. デプロイURLを `js/app.js` の `CONFIG.gasUrl` に設定

### 3. LINE通知の設定

以下の情報が既に設定されています：
- チャネルアクセストークン: `YOZ7Uft...`
- グループID: `C5a5b36e27a78ed6cfbb74839a8a9d04e`

## 使い方

1. アプリを開く
2. 「出勤」ボタンをタップ
3. LINEグループに通知が届く
4. 退勤時は「退勤」ボタンをタップ
5. 勤務時間が自動計算される

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: Google Apps Script（予定）
- **通知**: LINE Messaging API
- **データ保存**: LocalStorage + Google Spreadsheet（予定）
- **ホスティング**: GitHub Pages（予定）

## ファイル構成

```
attendance-app/
├── index.html          # メインHTML
├── manifest.json       # PWA設定
├── sw.js              # Service Worker
├── icon-192.png       # アプリアイコン (192x192)
├── icon-512.png       # アプリアイコン (512x512)
├── css/
│   └── style.css      # スタイルシート
└── js/
    └── app.js         # メインロジック
```

## ライセンス

MIT
