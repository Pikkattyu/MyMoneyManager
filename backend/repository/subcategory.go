package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// 資産情報の作成
func CreateSubcategory(category *models.Subcategory) error {
	if err := utils.DB.Create(category).Error; err != nil {
		log.Printf("サブカテゴリ情報の作成に失敗しました。")
		return err
	}
	return nil
}

// 資産情報の更新
func UpdateSubcategory(subcategory *models.Subcategory) error {

	updatedData := make(map[string]interface{})
	if subcategory.SubcategoryID == 0 {
		return errors.New("サブカテゴリIDがありません。")
	}
	updatedData["subcategory_id"] = subcategory.SubcategoryID

	// フィールドが空でない場合に、更新データに追加する
	if subcategory.CategoryID != 0 {
		updatedData["category_id"] = subcategory.CategoryID
	}
	if subcategory.SubcategoryName != "" {
		updatedData["subcategory_name"] = subcategory.SubcategoryName
	}
	if subcategory.Flg != 0 {
		updatedData["flg"] = subcategory.Flg
	}
	updatedData["update_time"] = time.Now()

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&subcategory).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating subcategory with subcategoryname %b: %v", subcategory.SubcategoryID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil

}

// 重複チェック用
func CheckSubcategoryConflicting(subcategory *models.Subcategory) int64 {

	var count int64

	// 条件に基づいて件数をカウント
	err := utils.DB.Table("subcategories").
		Where("category_id = ? AND subcategory_name = ? AND subcategory_id <> ? AND flg <> 1 ", subcategory.CategoryID, subcategory.SubcategoryName, subcategory.SubcategoryID).
		Count(&count).Error

	if err != nil {
		log.Printf("サブカテゴリの取得に失敗しました。CategoryID: %d, SubcategoryName: %s, SubcategoryID: %d, Error: %v",
			subcategory.CategoryID, subcategory.SubcategoryName, subcategory.SubcategoryID, err)
		return 2
	}

	return 0
}
