package models

import (
	"time"

	"gorm.io/gorm"
)

// Notice モデル
type Notice struct {
	NoticeID     int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID       int       `gorm:"not null"`                  // 外部キー　　　　　　　：NotNull制約
	CalendarID   int       `gorm:""`                          // 外部キー
	Title        string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	Txt          string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	DateStart    string    `gorm:"default:''"`                // 資産名
	DateEnd      string    `gorm:"default:''"`                // 資産名
	UpdateTime   time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	UpdateUserNo int       `gorm:"default:0"`                 // デフォルト0
	Register     time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	DelFlg       bool      `gorm:"not null;default:false"`    // 更新日時、デフォルトで現在のタイムスタンプ
}

func (u *Notice) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
