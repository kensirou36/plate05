# Google Apps Scriptセットアップガイド

このガイドでは、出退勤管理アプリとGoogle Spreadsheetを連携させる手順を説明します。

## ステップ1: スプレッドシートの作成

1. [Google Drive](https://drive.google.com)にアクセス
2. 「新規」→「Googleスプレッドシート」→「空白のスプレッドシート」をクリック
3. スプレッドシート名を「出退勤管理」に変更

## ステップ2: シート構成の作成

### シート1: 研修生マスタ

1. シート名を「研修生マスタ」に変更
2. 以下のヘッダーを入力:

| A列 | B列 | C列 |
|-----|-----|-----|
| 研修生ID | 氏名 | ステータス |
| user01 | あなたの名前 | 進行中 |

### シート2: 打刻記録

1. 新しいシートを作成（下部の「+」ボタン）
2. シート名を「打刻記録」に変更
3. 以下のヘッダーを入力:

| A列 | B列 | C列 | D列 | E列 | F列 |
|-----|-----|-----|-----|-----|-----|
| 日付 | 研修生ID | 氏名 | 出勤時刻 | 退勤時刻 | 勤務時間 |

### シート3: 課題完了記録

1. 新しいシートを作成
2. シート名を「課題完了記録」に変更
3. 以下のヘッダーを入力:

| A列 | B列 | C列 | D列 | E列 |
|-----|-----|-----|-----|-----|
| 完了日時 | 研修生ID | 氏名 | アプリURL | 判定 |

## ステップ3: スプレッドシートIDの取得

1. スプレッドシートのURLを確認
2. URLは以下の形式: `https://docs.google.com/spreadsheets/d/【ここがスプレッドシートID】/edit`
3. スプレッドシートIDをコピー

## ステップ4: Google Apps Scriptの設定

1. スプレッドシートで「拡張機能」→「Apps Script」をクリック
2. 新しいタブでApps Scriptエディタが開く
3. `Code.gs`ファイルの内容を全て削除
4. プロジェクトフォルダの`Code.gs`の内容をコピー&ペースト
5. 「保存」ボタンをクリック（💾アイコン）

## ステップ5: スクリプトプロパティの設定

設定値をコードから分離して安全に管理するため、スクリプトプロパティを使用します。

### 方法A: setupProperties関数を使う（推奨・簡単）

1. Apps Scriptエディタで `setupProperties` 関数を探す（下の方にあります）
2. `SPREADSHEET_ID` の値を実際のスプレッドシートIDに置き換える:

```javascript
function setupProperties() {
  const properties = PropertiesService.getScriptProperties();
  
  properties.setProperties({
    'SPREADSHEET_ID': 'あなたのスプレッドシートID',  // ← ここを変更
    'LINE_TOKEN': 'YOZ7Uft...',                    // ← すでに設定済み
    'GROUP_ID': 'C5a5b36e27a78ed6cfbb74839a8a9d04e' // ← すでに設定済み
  });
  
  Logger.log('プロパティの設定が完了しました');
}
```

3. 関数セレクタ（上部）で `setupProperties` を選択
4. 「実行」ボタン（▶️）をクリック
5. 初回実行時、権限の承認を求められたら承認
6. 実行ログ（下部）で「プロパティの設定が完了しました」を確認

### 方法B: GUIから設定する

1. Apps Scriptエディタの左サイドバーで「プロジェクトの設定」（⚙️アイコン）をクリック
2. 下にスクロールして「スクリプト プロパティ」セクションを見つける
3. 「スクリプト プロパティを追加」をクリック
4. 以下の3つのプロパティを追加:

| プロパティ | 値 |
|-----------|-----|
| SPREADSHEET_ID | あなたのスプレッドシートID |
| LINE_TOKEN | YOZ7UftinQaO3OyBDaloYu4cXzhYtLzmqBzAGNvCIJRg7h+DoqsX0n6OXdfOFZ9vI7/+VIOKgdWLHJ6yBmeAi6kPqz4+FZ3vpHQTBEAQSHA81c9tQLH/8oP8UUyRpnHxvmJ0QlaAjZWiraJeO38tBgdB04t89/1O/w1cDnyilFU= |
| GROUP_ID | C5a5b36e27a78ed6cfbb74839a8a9d04e |

5. 「スクリプト プロパティを保存」をクリック

### 設定の確認

1. 関数セレクタで `checkProperties` を選択
2. 「実行」ボタンをクリック
3. 実行ログで設定値を確認

## ステップ6: Web Appとしてデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で「ウェブアプリ」を選択
3. 以下の設定を行う:
   - **説明**: 出退勤管理API
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック
5. 権限の承認を求められたら:
   - 「アクセスを承認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「（プロジェクト名）に移動」をクリック
   - 「許可」をクリック
6. **Web AppのURL**をコピー（例: `https://script.google.com/macros/s/...../exec`）

## ステップ6: フロントエンドの設定

1. `attendance-app/js/app.js`を開く
2. 5行目の`gasUrl`にコピーしたWeb AppのURLを設定:

```javascript
const CONFIG = {
    userId: 'user01',
    userName: 'あなたの名前',
    gasUrl: 'https://script.google.com/macros/s/...../exec', // ここに貼り付け
    lineToken: 'YOZ7Uft...',
    groupId: 'C5a5b36e27a78ed6cfbb74839a8a9d04e'
};
```

3. ファイルを保存

## ステップ8: テスト

1. アプリをブラウザで開く
2. 「出勤」ボタンをクリック
3. 以下を確認:
   - ✅ トースト通知が表示される
   - ✅ スプレッドシートの「打刻記録」シートに記録が追加される
   - ✅ LINEグループに通知が届く

## トラブルシューティング

### スプレッドシートに記録されない

- Apps Scriptのログを確認:
  1. Apps Scriptエディタで「実行ログ」をクリック
  2. エラーメッセージを確認
- スプレッドシートIDが正しいか確認
- シート名が正確か確認（「打刻記録」）

### LINE通知が届かない

- LINEトークンとグループIDが正しいか確認
- LINE Messaging APIの設定を確認

### CORSエラーが出る

- Web Appのデプロイ設定で「アクセスできるユーザー」が「全員」になっているか確認
- デプロイURLが正しいか確認

## 完了！

これで出退勤管理アプリとGoogle Spreadsheetの連携が完了しました。
出勤・退勤の記録が自動的にスプレッドシートに保存され、LINEに通知されます。
