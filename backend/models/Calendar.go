package models

import (
	"time"

	"gorm.io/gorm"
)

// Calendar モデル
type Calendar struct {
	CalendarID      int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID          int       `gorm:"not null"`                  // 外部キー　　　　　　　：NotNull制約
	CategoryID      int       `gorm:"not null"`                  // 外部キー、not null
	SubcategoryID   int       `gorm:"not null;default:0"`        // 外部キー、not null]
	WorkID          int       `gorm:"not null;default:0"`        // 外部キー、not null
	Title           string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	StartDateTime   string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	EndDateTime     string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	IncomeFlg       int       `gorm:"not null;default:0"`        // 資産名　　　　　　　　：NotNull制約
	ViewFlg         bool      `gorm:"not null;default:false"`    // 資産名　　　　　　　　：NotNull制約
	Remarks         string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	Backgroundcolor string    `gorm:"default:#eeeeee"`           // 色指定
	UpdateTime      time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	UpdateUserNo    int       `gorm:"default:0"`                 // デフォルト0
	Register        time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	DelFlg          bool      `gorm:"not null;default:false"`    // 更新日時、デフォルトで現在のタイムスタンプ
}

type Calendar_Infomation struct {
	Calendar
	CategoryID      int
	CategoryName    string
	SubcategoryID   int
	SubcategoryName string
	WorkName        string
}

func (u *Calendar) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
