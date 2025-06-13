package models

import (
	"time"

	"gorm.io/gorm"
)

// Subcategory モデル
type TemplateInfomation struct {
	TemplateInfomationID int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	TemplateID           int       `gorm:"not null"`                  // 外部キー、not null
	CategoryID           int       `gorm:"not null"`                  // 外部キー、not null
	SubcategoryID        int       `gorm:"not null;default:0"`        // 外部キー、not null
	WorkID               int       `gorm:"not null;default:0"`        // 外部キー、not null
	Title                string    `gorm:"not null"`                  // NotNull制約
	StartTime            string    `gorm:"not null"`                  // NotNull制約
	EndTime              string    `gorm:"not null"`                  // NotNull制約
	IncomeFlg            int       `gorm:"not null;default:0"`        // NotNull制約
	ViewFlg              bool      `gorm:"not null;default:false"`    // NotNull制約
	Remarks              string    `gorm:"not null"`                  // NotNull制約
	Backgroundcolor      string    `gorm:"default:#eeeeee"`           // 色指定
	UpdateTime           time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register             time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	UpdateUserNo         int       `gorm:"default:0"`                 // デフォルト0
	DelFlg               bool      `gorm:"not null;default:false"`    //
}

func (u *TemplateInfomation) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
