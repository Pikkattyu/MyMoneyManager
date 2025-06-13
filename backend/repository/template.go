package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// メモの作成
func CreateTemplate(template *models.Template) (int, error) {
	if err := utils.DB.Create(template).Error; err != nil {
		log.Printf("案件の作成に失敗しました。")
		return 0, err
	}
	return template.TemplateID, nil
}

// メモの更新
func UpdateTemplate(template models.Template) error {

	updatedData := make(map[string]interface{})
	if template.TemplateID == 0 {
		return errors.New("メモIDがありません。")
	}
	updatedData["template_id"] = template.TemplateID

	if template.DelFlg {
		updatedData["del_flg"] = template.DelFlg
	} else {
		// フィールドが空でない場合に、更新データに追加する
		updatedData["template_name"] = template.TemplateName
		updatedData["remarks"] = template.Remarks
		updatedData["backgroundcolor"] = template.Backgroundcolor
	}
	updatedData["update_time"] = time.Now()

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&template).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating template with templatename %b: %v", template.TemplateID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil
}

func GetTemplateAll(BookID int) ([]models.Template_Infomation, error) {
	var templateInfomations []models.Template_Infomation

	if err := utils.DB.Table("templates t").
		Select(`
			t.template_id,
			t.template_name,
			t.remarks,
			t.backgroundcolor,
			ti.category_id,
			sc.category_name,
			ti.subcategory_id,
			ss.subcategory_name,
			ti.title,
			ti.start_time,
			ti.end_time,
			ti.income_flg,
			ti.view_flg,
			ws.work_id,
			ws.work_name
		`).
		Joins("INNER JOIN template_infomations ti ON t.template_id = ti.template_id").
		Joins("LEFT JOIN schedule_categories sc ON ti.category_id = sc.category_id").
		Joins("LEFT JOIN schedule_subcategories ss ON ti.subcategory_id = ss.subcategory_id").
		Joins("LEFT JOIN works ws ON ti.work_id = ws.work_id").
		Where("t.del_flg = false AND ti.del_flg = false AND t.book_id = ?", BookID).
		Order("t.template_id ASC, ti.start_time ASC").
		Scan(&templateInfomations).Error; err != nil {
		log.Printf("テンプレート情報の取得に失敗しました BookID: %d, Error: %v", BookID, err)

		return nil, err
	}
	return templateInfomations, nil
}

func GetTemplate(templateID int) ([]models.Template_Infomation, error) {
	var templateInfomations []models.Template_Infomation

	if err := utils.DB.Table("templates t").
		Select(`
		t.template_id,
		ti.template_infomation_id,
		t.template_name,
		t.remarks as Remarks,
		t.backgroundcolor as Backgroundcolor,
		ti.category_id,
		sc.category_name,
		ti.subcategory_id,
		ss.subcategory_name,
		ti.title,
		ti.start_time,
		ti.end_time,
		ti.income_flg,
		ti.view_flg,
		ti.remarks AS temp_remarks,
		ti.backgroundcolor AS temp_backgroundcolor,
		ws.work_id,
		ws.work_name
		`).
		Joins("INNER JOIN template_infomations ti ON t.template_id = ti.template_id").
		Joins("LEFT JOIN schedule_categories sc ON ti.category_id = sc.category_id").
		Joins("LEFT JOIN schedule_subcategories ss ON ti.subcategory_id = ss.subcategory_id").
		Joins("LEFT JOIN works ws ON ti.work_id = ws.work_id").
		Where("t.del_flg = false AND ti.del_flg = false AND t.template_id = ?", templateID).
		Order("t.template_id ASC, ti.start_time ASC").
		Scan(&templateInfomations).Error; err != nil {
		log.Printf("テンプレート情報の取得に失敗しました templateID: %d, Error: %v", templateID, err)

		return nil, err
	}
	return templateInfomations, nil
}
