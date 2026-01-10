# Google Apps Script プロパティ設定ガイド

## プロパティサービスとは？

Google Apps Scriptの**プロパティサービス**を使うと、APIキーやIDなどの設定値をコードから分離して安全に管理できます。

## 設定手順

### 方法1: setupProperties関数を使う（推奨）

1. Apps Scriptエディタで `Code.gs` を開く
2. `setupProperties` 関数の値を実際の値に置き換える:

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

3. 関数セレクタで `setupProperties` を選択
4. 「実行」ボタンをクリック
5. 実行ログで「プロパティの設定が完了しました」を確認

### 方法2: GUIから設定する

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

## スプレッドシートIDの取得方法

1. Google Spreadsheetを開く
2. URLを確認: `https://docs.google.com/spreadsheets/d/【ここがID】/edit`
3. IDの部分をコピー

例: 
- URL: `https://docs.google.com/spreadsheets/d/1abc123XYZ456/edit`
- ID: `1abc123XYZ456`

## 設定の確認

設定が正しく行われたか確認するには:

1. 関数セレクタで `checkProperties` を選択
2. 「実行」ボタンをクリック
3. 実行ログで設定値を確認

## トラブルシューティング

### エラー: "Cannot read property 'SPREADSHEET_ID' of null"

→ プロパティが設定されていません。上記の手順で設定してください。

### プロパティを削除したい

```javascript
function deleteAllProperties() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log('すべてのプロパティを削除しました');
}
```

### プロパティを更新したい

方法1の `setupProperties` を再実行するか、方法2のGUIから編集してください。

## メリット

✅ **セキュリティ**: APIキーをコードに直接書かない  
✅ **管理が簡単**: 設定値を一箇所で管理  
✅ **バージョン管理**: コードをGitにプッシュしても秘密情報が漏れない  
✅ **柔軟性**: 環境ごとに異なる設定を使える
