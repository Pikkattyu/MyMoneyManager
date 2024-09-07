package models

// Transaction モデル
type TransactionInfomation struct {
	TransactionInfomationID int `gorm:"primaryKey;autoIncrement"` // 主キー、自動インクリメント
	TransactionID           int `gorm:"not null"`                 // 外部キー
	AssetsID                int `gorm:"not null"`                 // 外部キー、not null
	Amount                  int `gorm:"default:0"`                // 金額、デフォルト値が0
	Flg                     int `gorm:"default:0"`                // 0が+, 1がマイナス、デフォルト値が0
}
