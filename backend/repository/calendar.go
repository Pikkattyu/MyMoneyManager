package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// 入出金履歴情報の作成
func CreateCalendar(calendar *models.Calendar) error {
	if err := utils.DB.Create(calendar).Error; err != nil {
		log.Printf("入出金履歴情報の作成に失敗しました。")
		return err
	}
	log.Printf("挿入後のCalendarID: %d", calendar.CalendarID)
	return nil
}

// 入出金履歴情報の更新
func UpdateCalendar(calendar *models.Calendar) error {

	updatedData := make(map[string]interface{})
	if calendar.CalendarID == 0 {
		return errors.New("calendarIDがありません")
	}
	if calendar.UpdateUserNo == 0 {
		return errors.New("更新者が不明です。")
	}
	updatedData["update_user_no"] = calendar.UpdateUserNo
	updatedData["calendar_id"] = calendar.CalendarID

	if calendar.DelFlg {
		updatedData["del_flg"] = calendar.DelFlg
	} else {
		// フィールドが空でない場合に、更新データに追加する
		if calendar.StartDateTime != "" {
			updatedData["start_date_time"] = calendar.StartDateTime
		}
		if calendar.EndDateTime != "" {
			updatedData["end_date_time"] = calendar.EndDateTime
		}
		if calendar.Backgroundcolor != "" {
			updatedData["backgroundcolor"] = calendar.Backgroundcolor
		}
		if calendar.Title != "" {
			updatedData["title"] = calendar.Title
		}
		if calendar.Remarks != "" {
			updatedData["remarks"] = calendar.Remarks
		}
		updatedData["view_flg"] = calendar.ViewFlg
		updatedData["category_id"] = calendar.CategoryID
		updatedData["subcategory_id"] = calendar.SubcategoryID
		updatedData["income_flg"] = calendar.IncomeFlg
		updatedData["work_id"] = calendar.WorkID
	}
	updatedData["update_time"] = time.Now()

	// 追加：更新内容のログ出力
	log.Printf("更新対象 calendarID: %d", calendar.CalendarID)
	log.Printf("更新データ: %+v", updatedData)

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&calendar).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating calendar with calendarname %b: %v", calendar.CalendarID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil
}

func GetCalendarMonth(BookID int, startDate time.Time, endDate time.Time) ([]models.Calendar_Infomation, error) {
	var calendarInfomations []models.Calendar_Infomation
	start := startDate.Format("2006-01-02 15:04:05")
	end := endDate.Format("2006-01-02 15:04:05")

	if err := utils.DB.Table("calendars ca").
		Select(`
            ca.calendar_id, 
			ca.work_id,
            ca.title, 
            ca.start_date_time, 
            ca.end_date_time,
            ca.view_flg, 
            ca.remarks, 
            ca.backgroundcolor,
            sca.category_id, 
            sca.category_name,
            ssca.subcategory_id, 
            ssca.subcategory_name
        `).
		Joins("LEFT JOIN schedule_categories sca ON ca.category_id = sca.category_id").
		Joins("LEFT JOIN schedule_subcategories ssca ON ca.subcategory_id = ssca.subcategory_id").
		Where("ca.del_flg = false AND  ca.book_id = ? AND ((ca.start_date_time >= ? AND ca.start_date_time <= ?) OR (ca.end_date_time >= ? AND ca.end_date_time <= ?))", BookID, start, end, start, end).
		Order("ca.start_date_time DESC, ca.calendar_id DESC").
		Scan(&calendarInfomations).Error; err != nil {
		log.Printf("取引情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return calendarInfomations, nil
}

func GetCalendar(calendarID int) ([]models.Calendar_Infomation, error) {
	var calendarInfomations []models.Calendar_Infomation

	if err := utils.DB.Table("calendars ca").
		Select(`
            ca.calendar_id, 
            ca.title, 
            ca.start_date_time, 
            ca.end_date_time,
            ca.income_flg, 
            ca.view_flg, 
            ca.remarks, 
            ca.backgroundcolor,
            sca.category_id, 
            sca.category_name,
            ssca.subcategory_id, 
            ssca.subcategory_name,
			ws.work_id,
			ws.work_name
        `).
		Joins("LEFT JOIN schedule_categories sca ON ca.category_id = sca.category_id").
		Joins("LEFT JOIN schedule_subcategories ssca ON ca.subcategory_id = ssca.subcategory_id").
		Joins("LEFT JOIN works ws ON ca.work_id = ws.work_id").
		Where("ca.del_flg = false AND  ca.calendar_id = ?", calendarID).
		Order("ca.start_date_time DESC, ca.calendar_id DESC").
		Scan(&calendarInfomations).Error; err != nil {
		log.Printf("取引情報の取得に失敗しました。 calendarID: %d, Error: %v", calendarID, err)
		return nil, err
	}
	return calendarInfomations, nil
}

func UpdateCalendarsInRange(BookID int, startDateStr string, endDateStr string) error {
	if err := utils.DB.Model(&models.Calendar{}).
		Where("book_id = ? AND start_date_time >= ? AND start_date_time < ? AND end_date_time >= ? AND end_date_time < ?", BookID, startDateStr, endDateStr, startDateStr, endDateStr).
		Updates(map[string]interface{}{
			"del_flg":     true, // ←更新したいフィールドを指定
			"update_time": time.Now(),
		}).Error; err != nil {
		log.Printf("カレンダーの更新に失敗しました。期間: %s ～ %s, Error: %v", startDateStr, endDateStr, err)
		return err
	}
	return nil
}
