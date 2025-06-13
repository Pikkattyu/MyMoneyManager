package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// 資産情報の作成
func CreateScheduleCategory(category *models.ScheduleCategory) (*models.ScheduleCategory, error) {
	if err := utils.DB.Create(category).Error; err != nil {
		log.Printf("カテゴリ情報の作成に失敗しました。")
		return nil, err
	}
	return category, nil
}

// 資産情報の更新
func UpdateScheduleCategory(subcategory *models.ScheduleCategory) error {

	updatedData := make(map[string]interface{})
	if subcategory.CategoryID == 0 {
		return errors.New("サブカテゴリIDがありません。")
	}
	updatedData["category_id"] = subcategory.CategoryID

	// フィールドが空でない場合に、更新データに追加する
	if subcategory.BookID != 0 {
		updatedData["book_id"] = subcategory.BookID
	}
	if subcategory.CategoryName != "" {
		updatedData["category_name"] = subcategory.CategoryName
	}
	if subcategory.IconPath != "" {
		updatedData["icon_path"] = subcategory.IconPath
	}
	if subcategory.Backgroundcolor != "" {
		updatedData["backgroundcolor"] = subcategory.Backgroundcolor
	}
	updatedData["income_flg"] = subcategory.IncomeFlg
	updatedData["update_time"] = time.Now()

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&subcategory).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating subcategory with subcategoryname %b: %v", subcategory.CategoryID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil

}

func GetScheduleCategoryAll(BookID int) ([]models.ScheduleCategory_SubCategory, error) {
	var categorys []models.ScheduleCategory_SubCategory

	if err := utils.DB.Table("schedule_categories").
		Select("schedule_categories.*, schedule_subcategories.subcategory_id, schedule_subcategories.subcategory_name").
		Joins("INNER JOIN schedule_subcategories ON schedule_categories.category_id = schedule_subcategories.category_id").
		Where("schedule_subcategories.del_flg = false AND schedule_categories.book_id = ?", BookID).
		Order("schedule_categories.category_id").
		Order("schedule_subcategories.subcategory_id").
		Scan(&categorys).Error; err != nil {
		log.Printf("カテゴリ情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return categorys, nil
}

func GetScheduleCategory(CategoryID int) ([]models.ScheduleCategory_SubCategory, error) {
	var categorys []models.ScheduleCategory_SubCategory

	if err := utils.DB.Table("schedule_categories").
		Select("schedule_categories.*, schedule_subcategories.subcategory_id, schedule_subcategories.subcategory_name").
		Joins("INNER JOIN schedule_subcategories ON schedule_categories.category_id = schedule_subcategories.category_id").
		Where("schedule_subcategories.del_flg = false AND schedule_categories.category_id = ?", CategoryID).
		Order("schedule_categories.category_name").
		Scan(&categorys).Error; err != nil {
		log.Printf("カテゴリ情報の取得に失敗しました。 CategoryID: %d, Error: %v", CategoryID, err)
		return nil, err
	}
	return categorys, nil
}

// 重複チェック用
func CheckScheduleCategoryConflicting(category *models.ScheduleCategory) int64 {

	var count int64

	// 条件に基づいて件数をカウント
	err := utils.DB.Table("schedule_categories").
		Where("book_id = ? AND category_name = ? AND category_id <> ?", category.BookID, category.CategoryName, category.CategoryID).
		Count(&count).Error

	if err != nil {
		log.Printf("資産情報の取得に失敗しました。BookID: %d, CategoryName: %s, CategoryID: %d, Error: %v",
			category.BookID, category.CategoryName, category.CategoryID, err)
		return 2
	}

	return 0
}

// 更新チェック用
func CheckScheduleCategoryUpdate(categoryID int, updateTime time.Time) int64 {

	var count int64

	// 条件に基づいて件数をカウント
	err := utils.DB.Table("schedule_categories").
		Where("category_id = ? AND update_time = ?", categoryID, updateTime).
		Count(&count).Error

	if err != nil {
		log.Printf("資産情報の取得に失敗しました。CategoryID: %d, UpdateTime: %s, Error: %v", categoryID, updateTime, err)
		return 2
	}

	return 0
}
