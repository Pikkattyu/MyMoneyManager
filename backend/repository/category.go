package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// 資産情報の作成
func CreateCategory(category *models.Category) (*models.Category, error) {
	if err := utils.DB.Create(category).Error; err != nil {
		log.Printf("カテゴリ情報の作成に失敗しました。")
		return nil, err
	}
	return category, nil
}

// 資産情報の更新
func UpdateCategory(subcategory *models.Category) error {

	updatedData := make(map[string]interface{})
	if subcategory.CategoryID == 0 {
		return errors.New("サブカテゴリIDがありません。")
	}
	updatedData["category_id"] = subcategory.CategoryID

	// フィールドが空でない場合に、更新データに追加する
	if subcategory.CategoryID != 0 {
		updatedData["book_id"] = subcategory.BookID
	}
	if subcategory.CategoryName != "" {
		updatedData["category_name"] = subcategory.CategoryName
	}
	if subcategory.Flg != 0 {
		updatedData["flg"] = subcategory.Flg
	}
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

func GetCategoryAll(BookID int) ([]models.Category_SubCategory, error) {
	var categorys []models.Category_SubCategory

	if err := utils.DB.Table("categories").
		Select("categories.*, subcategories.subcategory_id, subcategories.subcategory_name").
		Joins("INNER JOIN subcategories ON categories.category_id = subcategories.category_id").
		Where("subcategories.flg = 0 AND categories.flg <> 2 AND categories.book_id = ?", BookID).
		Order("categories.category_name").
		Scan(&categorys).Error; err != nil {
		log.Printf("カテゴリ情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return categorys, nil
}

func GetCategory(CategoryID int) ([]models.Category_SubCategory, error) {
	var categorys []models.Category_SubCategory

	if err := utils.DB.Table("categories").
		Select("categories.*, subcategories.subcategory_id, subcategories.subcategory_name").
		Joins("INNER JOIN subcategories ON categories.category_id = subcategories.category_id").
		Where("subcategories.flg = 0 AND categories.flg <> 2 AND categories.category_id = ?", CategoryID).
		Order("categories.category_name").
		Scan(&categorys).Error; err != nil {
		log.Printf("カテゴリ情報の取得に失敗しました。 CategoryID: %d, Error: %v", CategoryID, err)
		return nil, err
	}
	return categorys, nil
}

// 重複チェック用
func CheckCategoryConflicting(category *models.Category) int64 {

	var count int64

	// 条件に基づいて件数をカウント
	err := utils.DB.Table("categories").
		Where("book_id = ? AND flg = ? AND category_name = ? AND category_id <> ?", category.BookID, category.Flg, category.CategoryName, category.CategoryID).
		Count(&count).Error

	if err != nil {
		log.Printf("資産情報の取得に失敗しました。BookID: %d, Flg: %d, CategoryName: %s, CategoryID: %d, Error: %v",
			category.BookID, category.Flg, category.CategoryName, category.CategoryID, err)
		return 2
	}

	return 0
}

// 更新チェック用
func CheckCategoryUpdate(categoryID int, updateTime time.Time) int64 {

	var count int64

	// 条件に基づいて件数をカウント
	err := utils.DB.Table("categories").
		Where("category_id = ? AND update_time = ?", categoryID, updateTime).
		Count(&count).Error

	if err != nil {
		log.Printf("資産情報の取得に失敗しました。CategoryID: %d, UpdateTime: %s, Error: %v", categoryID, updateTime, err)
		return 2
	}

	return 0
}
