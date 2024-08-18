package models

import (
	"time"

	"gorm.io/gorm"
)

// Category モデル
type Category struct {
	CategoryID   int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID       int       `gorm:"not null"`                  // NotNull制約
	CategoryName string    `gorm:"not null"`                  // NotNull制約
	Flg          int       `gorm:"default:0"`                 // デフォルト値0(0が+, 1が-, 2が削除)
	UpdateTime   time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register     time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
}

type Category_SubCategory struct {
	Category
	SubcategoryID   int
	SubcategoryName string
}

func (u *Category) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
