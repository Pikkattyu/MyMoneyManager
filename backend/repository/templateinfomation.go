package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// 資産情報の作成
func CreateTemplateInfomation(category *models.TemplateInfomation) error {
	if err := utils.DB.Create(category).Error; err != nil {
		log.Printf("fサブカテゴリ情報の作成に失敗しました。")
		log.Printf(err.Error())
		return err
	}
	return nil
}

// 資産情報の更新
func UpdateTemplateInfomation(subcategory *models.TemplateInfomation) error {

	updatedData := make(map[string]interface{})
	if subcategory.TemplateInfomationID == 0 {
		return errors.New("サブカテゴリIDがありません。")
	}
	updatedData["subcategory_id"] = subcategory.TemplateInfomationID

	if subcategory.DelFlg {
		updatedData["del_flg"] = subcategory.DelFlg
	} else {
		// フィールドが空でない場合に、更新データに追加する
		updatedData["category_id"] = subcategory.CategoryID
		updatedData["subcategory_id"] = subcategory.SubcategoryID
		updatedData["title"] = subcategory.Title
		updatedData["start_time"] = subcategory.StartTime
		updatedData["end_time"] = subcategory.EndTime
		updatedData["income_flg"] = subcategory.IncomeFlg
		updatedData["view_flg"] = subcategory.ViewFlg
		updatedData["remarks"] = subcategory.Remarks
		updatedData["backgroundcolor"] = subcategory.Backgroundcolor
		updatedData["work_id"] = subcategory.WorkID
	}

	updatedData["update_user_no"] = subcategory.UpdateUserNo
	updatedData["update_time"] = time.Now()

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&subcategory).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating subcategory with subcategoryname %b: %v", subcategory.TemplateInfomationID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil

}
