package migrations

import (
	"MyMoneyManager/backend/models"
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// RunMigrations はデータベースのマイグレーションを実行します。
func RunMigrations() error {
	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=5432 sslmode=disable TimeZone=Asia/Tokyo"

	fmt.Println("Connecting to database...")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	fmt.Println("Running migrations...")
	if err := db.AutoMigrate(&models.User{}); err != nil {
		return fmt.Errorf("failed to migrate: %v", err)
	}

	fmt.Println("Migrations completed successfully.")
	return nil
}
