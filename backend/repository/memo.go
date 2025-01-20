package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// メモの作成
func CreateMemo(memo *models.Memo) error {
	if err := utils.DB.Create(memo).Error; err != nil {
		log.Printf("メモの作成に失敗しました。")
		return err
	}
	log.Printf("挿入後のMemoID: %d", memo.MemoID)
	return nil
}

// メモの更新
func UpdateMemo(memo models.Memo) error {

	updatedData := make(map[string]interface{})
	if memo.MemoID == 0 {
		return errors.New("メモIDがありません。")
	}
	if memo.UpdateUserNo == 0 {
		return errors.New("更新者が不明です。")
	}
	updatedData["update_user_no"] = memo.UpdateUserNo
	updatedData["memo_id"] = memo.MemoID

	if memo.Flg == 1 {
		updatedData["flg"] = memo.Flg
	} else {
		// フィールドが空でない場合に、更新データに追加する
		updatedData["txt"] = memo.Txt
		updatedData["title"] = memo.Title
		updatedData["date"] = memo.Date
	}
	updatedData["update_time"] = time.Now()
	updatedData["update_user_no"] = memo.UpdateUserNo

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&memo).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating memo with memoname %b: %v", memo.MemoID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil
}

func GetMemo(MemoID int) ([]models.Memo, error) {
	var memoInfomations []models.Memo

	if err := utils.DB.Table("memos").
		Select(`
            memos.memo_id, 
            memos.book_id, 
            memos.date, 
            memos.title, 
            memos.txt, 
            memos.flg,
            memos.update_time
        `).
		Where("memos.memo_id = ? ", MemoID).
		Order("memos.date DESC, memos.memo_id DESC").
		Scan(&memoInfomations).Error; err != nil {
		log.Printf("メモ情報の取得に失敗しました。 MemoID: %d, Error: %v", MemoID, err)
		return nil, err
	}
	return memoInfomations, nil
}

func GetMemoMonth(BookID int, startDate time.Time, endDate time.Time) ([]models.Memo, error) {
	var memoInfomations []models.Memo

	if err := utils.DB.Table("memos").
		Select(`
            memos.memo_id, 
            memos.book_id, 
            memos.date, 
            memos.title, 
            memos.txt, 
            memos.flg,
            memos.update_time
        `).
		Where("memos.flg <> 1 AND memos.book_id = ? AND memos.date >= ? AND memos.date <= ?", BookID, startDate, endDate).
		Order("memos.date DESC, memos.memo_id DESC").
		Scan(&memoInfomations).Error; err != nil {
		log.Printf("メモ情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return memoInfomations, nil
}
