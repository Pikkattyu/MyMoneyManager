package models

import (
	"time"

	"gorm.io/gorm"
)

// Memo モデル
type Memo struct {
	MemoID         int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID         int       `gorm:"default:0"`                 // デフォルト0
	Date           time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Title          string    `gorm:"default:''"`                // デフォルト値''
	Txt            string    `gorm:"default:''"`                // デフォルト値''
	Flg            int       `gorm:"default:0"`                 // デフォルト値0
	UpdateUserNo   int       `gorm:"default:0"`                 // デフォルト0
	RegisterUserNo int       `gorm:"default:0"`                 // デフォルト0
	UpdateTime     time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register       time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
}

func (u *Memo) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
