package models

import (
	"time"

	"gorm.io/gorm"
)

// Book モデル
type Book struct {
	BookID        int       `gorm:"primaryKey;autoIncrement"`            // 主キー
	UserNo        int       `gorm:"not null;index:idx_user_book,unique"` // NotNull制約 & UserIDとBookNameの一意制約
	AttendUserNos string    `gorm:""`                                    // 固定長で文字を出す…10桁区切り
	BookName      string    `gorm:"not null;index:idx_user_book,unique"` // NotNull制約 & UserIDとBookNameの一意制約
	StartDay      string    `gorm:"not null"`                            // NotNull制約
	StartWeekDay  string    `gorm:"not null"`                            // NotNull制約
	Flg           int       `gorm:"default:0"`                           // デフォルト値0
	UpdateTime    time.Time `gorm:"default:current_timestamp"`           // デフォルト現在の時間
	Register      time.Time `gorm:"default:current_timestamp"`           // デフォルト現在の時間
}

func (u *Book) BeforeCreate(tx *gorm.DB) (err error) {
	if u.UpdateTime.IsZero() {
		u.UpdateTime = time.Now()
	}
	if u.Register.IsZero() {
		u.Register = time.Now()
	}
	return
}
