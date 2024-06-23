package main

import (
	"MyMoneyManager/backend/config"
	"MyMoneyManager/backend/migrations"
	"MyMoneyManager/backend/routes"
	"MyMoneyManager/backend/utils"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 設定を読み込む
	config.LoadConfig()

	// データベースを初期化する
	utils.InitDB()

	// マイグレーションを実行する
	if err := migrations.RunMigrations(); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	// Ginのルーターを設定する
	router := gin.Default()

	// ルーティングを設定する
	routes.InitializeRoutes(router)

	// サーバーを起動し、ポート8080でリクエストを待機する
	log.Println("Server listening on port 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
