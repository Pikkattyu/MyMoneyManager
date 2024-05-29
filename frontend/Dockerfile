# ベースイメージとしてNode.jsの最新版を使用
FROM node:20

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm install

# 残りのプロジェクトファイルをコピー
COPY . .

# ビルド
RUN npm run build

# アプリケーションを起動
CMD ["npm", "run", "dev"]