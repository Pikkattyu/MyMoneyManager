package models

import (
	"time"

	"gorm.io/gorm"
)

// User モデル
type User struct {
	UserID    string    `gorm:"primaryKey"`                // 主キー
	UserName  string    `gorm:"not null"`                  // NotNull制約
	Email     string    `gorm:"unique;not null"`           // 主キー相当のユニーク制約（NotNullも追加）
	Password  string    `gorm:"not null"`                  // NotNull制約
	Flg       int       `gorm:"default:0"`                 // デフォルト値0
	LastLogin time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register  time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.LastLogin.IsZero() {
		u.LastLogin = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
