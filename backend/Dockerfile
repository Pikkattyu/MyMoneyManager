FROM golang:latest

# air をインストール
RUN go install github.com/cosmtrek/air@latest

# ワークディレクトリの設定
WORKDIR /app

# Goモジュールファイルをコピー
COPY go.mod ./
COPY go.sum ./

# 依存関係のインストール
RUN go mod download

# ソースコードをコピー
COPY . .

# Air の設定ファイルをコピー（もしあれば）
COPY .air.toml ./

# コンテナ起動時に air を実行
CMD ["air"]