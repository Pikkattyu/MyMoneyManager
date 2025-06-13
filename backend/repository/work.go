package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// メモの作成
func CreateWork(work *models.Work) error {
	if err := utils.DB.Create(work).Error; err != nil {
		log.Printf("案件の作成に失敗しました。")
		return err
	}
	return nil
}

// メモの更新
func UpdateWork(work models.Work) error {

	updatedData := make(map[string]interface{})
	if work.WorkID == 0 {
		return errors.New("メモIDがありません。")
	}
	if work.UpdateUserNo == 0 {
		return errors.New("更新者が不明です。")
	}
	updatedData["update_user_no"] = work.UpdateUserNo
	updatedData["work_id"] = work.WorkID

	if work.DelFlg {
		updatedData["del_flg"] = work.DelFlg
	} else {
		// フィールドが空でない場合に、更新データに追加する
		updatedData["agent"] = work.Agent
		updatedData["company"] = work.Company
		updatedData["pay_type"] = work.PayType
		updatedData["remarks"] = work.Remarks
		updatedData["salary"] = work.Salary
		updatedData["work_name"] = work.WorkName
		updatedData["work_type"] = work.WorkType
	}
	updatedData["update_time"] = time.Now()
	updatedData["update_user_no"] = work.UpdateUserNo

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&work).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating work with workname %b: %v", work.WorkID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil
}

func GetWorkAll(BookID int) ([]models.Work, error) {
	var workInfomations []models.Work

	if err := utils.DB.Table("works").
		Select(`
            works.work_id, 
            works.book_id, 
            works.work_name, 
            works.work_type, 
            works.pay_type, 
            works.salary, 
            works.company, 
            works.agent, 
            works.remarks
        `).
		Where("works.book_id = ? AND del_flg = false", BookID).
		Order("works.work_id DESC").
		Scan(&workInfomations).Error; err != nil {
		log.Printf("メモ情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return workInfomations, nil
}

func GetWork(workID int) ([]models.Work, error) {
	var workInfomations []models.Work

	if err := utils.DB.Table("works").
		Select(`
            works.work_id, 
            works.book_id, 
            works.work_name, 
            works.work_type, 
            works.pay_type, 
            works.salary, 
            works.company, 
            works.agent, 
            works.remarks
        `).
		Where("works.work_id = ? ", workID).
		Scan(&workInfomations).Error; err != nil {
		log.Printf("メモ情報の取得に失敗しました。 workID: %d, Error: %v", workID, err)
		return nil, err
	}
	return workInfomations, nil
}

type WorkDuration struct {
	WorkID          int `json:"work_id"`
	Salary          int `json:"salary"`
	DurationMinutes int `json:"duration_minutes"`
	PayTypeCode     int `json:"pay_type_code"`
}

func GetWorkDurations(BookID int, startDate string, endDate string) ([]WorkDuration, error) {
	var results []WorkDuration
	log.Printf("勤務時間の取得に失敗しました。BookID: %d, sd: %s, ed: %s", BookID, startDate, endDate)
	sql := `
	SELECT 
		ws.work_id, 
  		ws.salary,
		0 AS duration_minutes, 
		0 AS pay_type_code
	FROM works ws
	WHERE ws.book_id = ? AND ws.pay_type = '時給' AND ws.del_flg = false

	UNION ALL
	SELECT 
		ws.work_id,
  		ws.salary,
		COALESCE(SUM(FLOOR(EXTRACT(EPOCH FROM (ca.end_date_time::timestamp - ca.start_date_time::timestamp)) / 60)), 0) AS duration_minutes,
		1 AS pay_type_code
	FROM works ws
	INNER JOIN calendars ca ON ws.work_id = ca.work_id
	WHERE 
		ws.book_id = ?
		AND ca.start_date_time >= ?
		AND ca.end_date_time < ?
		AND ws.pay_type = '月給'
		AND ws.del_flg = false
	GROUP BY ws.work_id

	UNION ALL
	SELECT 
		ws.work_id,
  		ws.salary,
		COALESCE(SUM(FLOOR(EXTRACT(EPOCH FROM (ca.end_date_time::timestamp - ca.start_date_time::timestamp)) / 60)), 0) AS duration_minutes,
		2 AS pay_type_code
	FROM works ws
	INNER JOIN calendars ca ON ws.work_id = ca.work_id
	WHERE 
		ws.book_id = ?
		AND ca.start_date_time <> ''
		AND ca.end_date_time <> ''
		AND ws.pay_type = '単価'
		AND ws.del_flg = false
	GROUP BY ws.work_id
	`

	if err := utils.DB.Raw(sql, BookID, BookID, startDate, endDate, BookID).Scan(&results).Error; err != nil {
		log.Printf("勤務時間の取得に失敗しました。BookID: %d, Error: %v", BookID, err)
		return nil, err
	}

	return results, nil
}
