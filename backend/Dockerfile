# Goのベースイメージを指定
FROM golang:latest

# ワークディレクトリを設定
WORKDIR /app

# 必要な依存関係をインストール
RUN apt-get update && apt-get install -y \
    git

# Airをインストール
RUN go install github.com/air-verse/air@latest

# Goモジュールファイルをコピー
COPY go.mod ./
COPY go.sum ./

# 依存関係のインストール
RUN go mod download

# .envファイルをコピー
COPY .env ./

# ソースコードをコピー
COPY . .

# コンテナ起動時に air を実行
CMD ["air"]