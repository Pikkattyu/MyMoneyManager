package models

import (
	"time"

	"gorm.io/gorm"
)

// Subcategory モデル
type Subcategory struct {
	SubcategoryID   int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	CategoryID      int       `gorm:"not null"`                  // NotNull制約
	SubcategoryName string    `gorm:"not null"`                  // NotNull制約
	Flg             int       `gorm:"default:0"`                 // デフォルト値0(1が削除)
	UpdateTime      time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register        time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
}

func (u *Subcategory) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
