package models

import (
	"time"

	"gorm.io/gorm"
)

// Assets モデル
type Assets struct {
	AssetsID        int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	BookID          int       `gorm:"not null"`                  // 外部キー　　　　　　　：NotNull制約
	UserNo          int       `gorm:"not null"`                  // 外部キー　　　　　　　：NotNull制約
	AssetsName      string    `gorm:"not null"`                  // 資産名　　　　　　　　：NotNull制約
	Tag             string    `gorm:"not null"`                  // タグ名（現金など）　　：NotNull制約
	Amount          int       `gorm:"default:0"`                 // 金額　　　　　　　　　：デフォルト値0
	Excluded        bool      `gorm:"default:false"`             // 資産計上の場合　　　　：デフォルト値false
	Backgroundcolor string    `gorm:"default:#eeeeee"`           // 色指定
	IconPath        string    `gorm:"default:MemoIcon.png"`      // アイコン指定
	Flg             int       `gorm:"default:0"`                 // (0が+, 1が-, 2が削除)：デフォルト値0
	UpdateTime      time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	UpdateUserNo    int       `gorm:"default:0"`                 // デフォルト0
	Register        time.Time `gorm:"default:current_timestamp"` // デフォルト現在の時間
	DelFlg          bool      `gorm:"not null;default:false"`    // 更新日時、デフォルトで現在のタイムスタンプ
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
