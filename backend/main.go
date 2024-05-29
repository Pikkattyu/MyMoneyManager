package main

import (
    "fmt"
    "log"
    "net/http"
    "MyMoneyManager/backend/migrations"
)

func main() {
    // マイグレーションを実行する
    if err := migrations.RunMigrations(); err != nil {
        log.Fatalf("failed to run migrations: %v", err)
    }

    // ルーティングを設定する
    http.HandleFunc("/", handlerFunc)

    // サーバーを起動し、ポート8080でリクエストを待機する
    fmt.Println("Server listening on port 8080...")
    http.ListenAndServe(":8080", nil)
}

// リクエストを処理するハンドラー関数
func handlerFunc(w http.ResponseWriter, r *http.Request) {
    // レスポンスを書き込む
    fmt.Fprintln(w, "Hello, World!")
}
