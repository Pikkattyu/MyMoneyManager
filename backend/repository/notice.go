package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// メモの作成
func CreateNotice(notice *models.Notice) error {
	if err := utils.DB.Create(notice).Error; err != nil {
		log.Printf("案件の作成に失敗しました。")
		return err
	}
	return nil
}

// メモの更新
func UpdateNotice(notice models.Notice) error {

	updatedData := make(map[string]interface{})
	if notice.NoticeID == 0 {
		return errors.New("メモIDがありません。")
	}
	if notice.UpdateUserNo == 0 {
		return errors.New("更新者が不明です。")
	}
	updatedData["update_user_no"] = notice.UpdateUserNo
	updatedData["notice_id"] = notice.NoticeID

	if notice.DelFlg {
		updatedData["del_flg"] = notice.DelFlg
	} else {
		// フィールドが空でない場合に、更新データに追加する
		updatedData["title"] = notice.Title
		updatedData["txt"] = notice.Txt
		updatedData["date_start"] = notice.DateStart
		updatedData["date_end"] = notice.DateEnd
	}
	updatedData["update_time"] = time.Now()
	updatedData["update_user_no"] = notice.UpdateUserNo

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&notice).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating notice with noticename %b: %v", notice.NoticeID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil
}

func GetNoticeAll(BookID int) ([]models.Notice, error) {
	var noticeInfomations []models.Notice

	if err := utils.DB.Table("notices").
		Select(`
            notices.notice_id, 
            notices.title, 
            notices.txt,
			notices.date_start,
			notices.date_end
        `).
		Where("notices.book_id = ? AND del_flg = false", BookID).
		Order("notices.notice_id DESC").
		Scan(&noticeInfomations).Error; err != nil {
		log.Printf("メモ情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return noticeInfomations, nil
}

func GetNoticeDate(BookID int, Date string) ([]models.Notice, error) {
	var noticeInfomations []models.Notice

	if err := utils.DB.Table("notices").
		Select(`
            notices.notice_id, 
            notices.title, 
            notices.txt,
			notices.date_start,
			notices.date_end
        `).
		Where(`
			notices.book_id = ? 
			AND del_flg = false 
			AND (
				   (date_start <= ? AND date_end >= ?) 
				OR (date_start = '' AND date_end >= ?)
				OR (date_start <= ? AND date_end = '')
			)`, BookID, Date, Date, Date, Date).
		Order("notices.notice_id DESC").
		Scan(&noticeInfomations).Error; err != nil {
		log.Printf("メモ情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return noticeInfomations, nil
}

func GetNotice(noticeID int) ([]models.Notice, error) {
	var noticeInfomations []models.Notice

	if err := utils.DB.Table("notices").
		Select(`
            notices.notice_id, 
            notices.title, 
            notices.txt,
			notices.date_start,
			notices.date_end
        `).
		Where("notices.notice_id = ? ", noticeID).
		Scan(&noticeInfomations).Error; err != nil {
		log.Printf("メモ情報の取得に失敗しました。 noticeID: %d, Error: %v", noticeID, err)
		return nil, err
	}
	return noticeInfomations, nil
}
