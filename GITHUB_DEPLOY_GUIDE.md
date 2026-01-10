# GitHub Pagesデプロイガイド

このガイドでは、出退勤管理アプリをGitHub Pagesにデプロイして、インターネット上で公開する手順を説明します。

## 📋 前提条件

- GitHubアカウントを持っている
- Gitがインストールされている（確認: `git --version`）
- GitHubにログインしている

## 🚀 デプロイ手順

### ステップ1: GitHubで新しいリポジトリを作成

1. [GitHub](https://github.com)にアクセスしてログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ情報を入力:
   - **Repository name**: `attendance-app`（任意の名前でOK）
   - **Description**: 出退勤管理アプリ
   - **Public** を選択（GitHub Pagesは無料プランではPublicのみ）
   - ✅ **「Add a README file」のチェックは外す**（重要！）
   - ✅ **「Add .gitignore」も選択しない**
   - ✅ **「Choose a license」も選択しない**
4. 「Create repository」をクリック

### ステップ2: リポジトリURLをコピー

リポジトリ作成後、以下のような画面が表示されます:

```
Quick setup — if you've done this kind of thing before
https://github.com/YOUR_USERNAME/attendance-app.git
```

この **URLをコピー** しておきます（後で使います）

### ステップ3: ローカルでGitリポジトリを初期化

PowerShellまたはターミナルを開いて、以下のコマンドを実行します:

```powershell
# アプリのディレクトリに移動
cd C:\Users\本山　拓弥\.gemini\antigravity\scratch\attendance-app

# Gitリポジトリを初期化
git init
```

**結果**: `.git`フォルダが作成され、Gitの管理下になります

### ステップ4: ファイルをステージングエリアに追加

```powershell
# すべてのファイルを追加
git add .
```

**説明**:
- `git add .`: カレントディレクトリのすべてのファイルをステージング（コミット準備）
- `.gitignore`がある場合、そこに記載されたファイルは除外されます

**確認**:
```powershell
# ステージングされたファイルを確認
git status
```

### ステップ5: 最初のコミットを作成

```powershell
# コミット（変更を記録）
git commit -m "Initial commit: 出退勤管理アプリ"
```

**説明**:
- `-m "メッセージ"`: コミットメッセージを指定
- コミットメッセージは変更内容を簡潔に説明するもの

### ステップ6: デフォルトブランチ名を変更

```powershell
# ブランチ名を main に変更
git branch -M main
```

**説明**:
- 古いGitではデフォルトブランチが`master`
- 現在は`main`が標準なので変更します
- `-M`: 強制的に名前を変更

### ステップ7: リモートリポジトリを追加

```powershell
# GitHubのリポジトリをリモートとして追加
git remote add origin https://github.com/YOUR_USERNAME/attendance-app.git
```

**⚠️ 重要**: `YOUR_USERNAME`を**あなたのGitHubユーザー名**に置き換えてください！

例:
```powershell
git remote add origin https://github.com/takuya-motoyama/attendance-app.git
```

**説明**:
- `origin`: リモートリポジトリの別名（慣例的に使われる名前）
- このコマンドでローカルとGitHubを紐付けます

**確認**:
```powershell
# リモートリポジトリを確認
git remote -v
```

### ステップ8: GitHubにプッシュ

```powershell
# GitHubにアップロード
git push -u origin main
```

**説明**:
- `push`: ローカルの変更をリモート（GitHub）に送信
- `-u origin main`: 今後`git push`だけで同じブランチにプッシュできるように設定
- 初回はGitHubの認証が求められる場合があります

**認証方法**:
- **Personal Access Token（推奨）**: GitHubで生成したトークンを使用
- **GitHub CLI**: `gh auth login`で認証

### ステップ9: GitHub Pagesを有効化

1. GitHubのリポジトリページにアクセス
2. 「Settings」タブをクリック
3. 左サイドバーで「Pages」をクリック
4. 「Source」セクションで:
   - **Branch**: `main`を選択
   - **Folder**: `/ (root)`を選択
5. 「Save」をクリック

**数分待つと**、以下のようなメッセージが表示されます:

```
Your site is live at https://YOUR_USERNAME.github.io/attendance-app/
```

### ステップ10: アプリにアクセス

ブラウザで以下のURLにアクセス:

```
https://YOUR_USERNAME.github.io/attendance-app/
```

🎉 **デプロイ完了！**

## 📱 スマホでテスト

1. スマホのブラウザで上記URLにアクセス
2. ブラウザメニューから「ホーム画面に追加」を選択
3. アプリ名を確認して追加
4. ホーム画面のアイコンからアプリを起動

## 🔄 更新方法

アプリを更新した場合は、以下のコマンドでGitHub Pagesに反映できます:

```powershell
# 変更をステージング
git add .

# コミット
git commit -m "更新内容の説明"

# GitHubにプッシュ
git push
```

数分後、自動的にGitHub Pagesが更新されます。

## ⚠️ トラブルシューティング

### エラー: "fatal: not a git repository"

→ `git init`を実行していない可能性があります。ステップ3に戻ってください。

### エラー: "remote origin already exists"

→ すでにリモートが設定されています。以下で確認:
```powershell
git remote -v
```

削除して再設定する場合:
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/attendance-app.git
```

### エラー: "failed to push some refs"

→ リモートに変更がある可能性があります:
```powershell
git pull origin main --rebase
git push
```

### GitHub Pagesが404エラー

1. リポジトリがPublicになっているか確認
2. Settings > Pagesで正しく設定されているか確認
3. 数分待ってから再度アクセス
4. `index.html`がルートディレクトリにあるか確認

### 認証エラー

**Personal Access Tokenを使う場合**:

1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. 「Generate new token」をクリック
3. スコープで「repo」を選択
4. トークンを生成してコピー
5. Gitのパスワード入力時にトークンを使用

## 📝 .gitignoreの作成（推奨）

不要なファイルをGitHubにアップロードしないよう、`.gitignore`を作成することを推奨します:

```gitignore
# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Logs
*.log

# Temporary files
*.tmp
*.temp
```

## 🎯 次のステップ

1. ✅ GitHub Pagesにデプロイ完了
2. ⏳ Google Apps Scriptの設定
3. ⏳ スマホでPWAとしてインストール
4. ⏳ 実際に出退勤を記録してテスト

## 📚 参考リンク

- [GitHub Pages公式ドキュメント](https://docs.github.com/ja/pages)
- [Git基本コマンド](https://git-scm.com/docs)
- [GitHub認証について](https://docs.github.com/ja/authentication)
