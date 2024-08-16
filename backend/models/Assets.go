package models

import (
	"time"

	"gorm.io/gorm"
)

// Assets モデル
type Assets struct {
	AssetsID   int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID     int       `gorm:"not null"`                  // NotNull制約
	AssetsName string    `gorm:"not null"`                  // NotNull制約
	Tag        string    `gorm:"not null"`                  // NotNull制約
	UserNo     int       `gorm:"not null"`                  // NotNull制約
	Amount     int       `gorm:"default:0"`                 // デフォルト値0
	Excluded   bool      `gorm:"default:false"`             // デフォルト値false
	Flg        int       `gorm:"default:0"`                 // デフォルト値0(0が+, 1が-, 2が削除)
	UpdateTime time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	Register   time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
}

type AssetWithUserName struct {
	Assets
	UserName string
}

func (u *Assets) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
