package models

import (
	"time"

	"gorm.io/gorm"
)

// Subcategory モデル
type ScheduleSubcategory struct {
	SubcategoryID   int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	CategoryID      int       `gorm:"not null"`                  // NotNull制約
	SubcategoryName string    `gorm:"not null"`                  // NotNull制約
	UpdateTime      time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register        time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	UpdateUserNo    int       `gorm:"default:0"`                 // デフォルト0
	DelFlg          bool      `gorm:"not null;default:false"`    // 更新日時、デフォルトで現在のタイムスタンプ
}

func (u *ScheduleSubcategory) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
