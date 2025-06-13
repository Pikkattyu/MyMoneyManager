package models

import (
	"time"

	"gorm.io/gorm"
)

// Category モデル
type ScheduleCategory struct {
	CategoryID      int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID          int       `gorm:"not null"`                  // NotNull制約
	CategoryName    string    `gorm:"not null"`                  // NotNull制約
	IncomeFlg       bool      `gorm:"default:false"`             //
	Backgroundcolor string    `gorm:"default:#eeeeee"`           // 色指定
	IconPath        string    `gorm:"default:MemoIcon.png"`      // アイコン指定
	UpdateTime      time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register        time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
}

type ScheduleCategory_SubCategory struct {
	ScheduleCategory
	SubcategoryID   int
	SubcategoryName string
}

func (u *ScheduleCategory) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
