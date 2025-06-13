package models

import (
	"time"

	"gorm.io/gorm"
)

// Category モデル
type Template struct {
	TemplateID      int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID          int       `gorm:"not null"`                  // NotNull制約
	TemplateName    string    `gorm:"not null"`                  // NotNull制約
	Remarks         string    `gorm:"not null"`                  // 備考
	Backgroundcolor string    `gorm:"default:#eeeeee"`           // 色指定
	UpdateTime      time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register        time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	DelFlg          bool      `gorm:"not null;default:false"`    //
}

type Template_Infomation struct {
	TemplateID           int
	TemplateInfomationID int
	TemplateName         string
	Remarks              string
	Backgroundcolor      string
	CategoryID           int
	CategoryName         string
	SubcategoryID        int
	SubcategoryName      string
	WorkID               int
	WorkName             string
	Title                string
	StartTime            string
	EndTime              string
	IncomeFlg            int
	ViewFlg              bool
	TempRemarks          string `json:"temp_remarks"`         // TemplateInfomationのRemarks
	TempBackgroundcolor  string `json:"temp_backgroundcolor"` // TemplateInfomationのBackgroundcolor
}

func (u *Template) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
