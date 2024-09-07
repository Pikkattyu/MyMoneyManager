package models

import (
	"time"

	"gorm.io/gorm"
)

// Transaction モデル
type Transaction struct {
	TransactionID  int       `gorm:"primaryKey;autoIncrement"`           // 主キー、自動インクリメント
	BookID         int       `gorm:"not null"`                           // 外部キー、not null
	Kind           int       `gorm:"not null;default:0"`                 // 0が入金、1が支出、2が振替、not null
	Memo           string    `gorm:""`                                   // メモ、任意の文字列
	CategoryID     int       `gorm:"not null"`                           // 外部キー、not null
	SubcategoryID  int       `gorm:"not null;default:0"`                 // 外部キー、not null
	RegisterUserNo int       `gorm:"not null"`                           // 登録ユーザ、not null
	UpdateUserNo   int       `gorm:"not null"`                           // 更新ユーザ、not null
	Date           time.Time `gorm:"not null;"`                          // 内容の日付、not null'
	Register       time.Time `gorm:"not null;default:current_timestamp"` // 登録日時、デフォルトで現在のタイムスタンプ
	UpdateTime     time.Time `gorm:"not null;default:current_timestamp"` // 更新日時、デフォルトで現在のタイムスタンプ
}
type Transaction_Infomation struct {
	Transaction
	TransactionInfomation
	TransactionID   int
	AssetsName      string
	CategoryName    string
	SubcategoryName string
}

func (u *Transaction) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
