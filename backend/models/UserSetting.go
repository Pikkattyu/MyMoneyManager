package models

import (
	"time"

	"gorm.io/gorm"
)

// UserSetting モデル
type UserSetting struct {
	UserNo                         int       `gorm:"primaryKey;autoIncrement"`  // 主キー
	ExcludeAfterDate               bool      `gorm:"default:false"`             // 日付以降を計上しない設定 (True/False)
	AutoFeeAllocationCategoryID    int       `gorm:"default:0"`                 // 手数料自動設定
	AutoFeeAllocationSubcategoryID int       `gorm:"default:0"`                 // 手数料自動設定
	AutoFeeAllocationAssetsID      int       `gorm:"default:0"`                 // 手数料自動設定
	DefaultTransactionType         int       `gorm:"default:0"`                 // デフォルト取引タイプ
	DefaultTransactionDisplay      int       `gorm:"default:3"`                 // デフォルト取引表示
	MonthStartDate                 int       `gorm:"default:1"`                 // 月の開始日 (1～31)
	WeekStartDay                   int       `gorm:"default:0"`                 // 週の開始曜日
	ShowZeroAmountItems            bool      `gorm:"default:false"`             // 0円項目の表示/非表示
	UpdateTime                     time.Time `gorm:"default:current_timestamp"` // 更新時刻
	Register                       time.Time `gorm:"default:current_timestamp"` // 登録時刻
}

func (u *UserSetting) BeforeCreate(tx *gorm.DB) (err error) {
	if u.Register.IsZero() {
		u.Register = time.Now()
	}

	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	return
}
