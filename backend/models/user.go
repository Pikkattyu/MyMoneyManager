package models

import (
	"time"

	"gorm.io/gorm"
)

// User モデル
type User struct {
	UserNo    int       `gorm:"primaryKey;autoIncrement"`       // 主キー
	UserID    string    `gorm:"not null;index:idx_user,unique"` // 主キー相当のユニーク制約（NotNullも追加）
	UserName  string    `gorm:"not null;unique"`                // NotNull制約
	Email     string    `gorm:"not null;index:idx_user,unique"` // 主キー相当のユニーク制約（NotNullも追加）
	Password  string    `gorm:"not null"`                       // NotNull制約
	BookID    int       `gorm:"default:0"`                      // デフォルト値0
	Flg       int       `gorm:"default:0"`                      // デフォルト値0
	LastLogin time.Time `gorm:"default:current_timestamp"`      // デフォルト現在の時間
	Register  time.Time `gorm:"default:current_timestamp"`      // デフォルト現在の時間
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
