package models

import (
	"time"

	"gorm.io/gorm"
)

// Work モデル
type Work struct {
	WorkID       int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID       int       `gorm:"not null"`                  // 外部キー　　　　　　　：NotNull制約
	UserNo       int       `gorm:"not null"`                  // 外部キー　　　　　　　：NotNull制約
	WorkName     string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	WorkType     string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	PayType      string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	Salary       int       `gorm:"default:0"`                 // 金額　　　　　　　　　：デフォルト値0
	Company      string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	Agent        string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	Remarks      string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	UpdateTime   time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	UpdateUserNo int       `gorm:"default:0"`                 // デフォルト0
	Register     time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	DelFlg       bool      `gorm:"not null;default:false"`    // 更新日時、デフォルトで現在のタイムスタンプ
}

func (u *Work) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
