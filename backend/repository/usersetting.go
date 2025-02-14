package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// メモの作成
func CreateUserSetting(usersetting *models.UserSetting) error {
	if err := utils.DB.Create(usersetting).Error; err != nil {
		log.Printf("メモの作成に失敗しました。")
		return err
	}
	return nil
}

// メモの更新
func UpdateUserSetting(usersetting models.UserSetting) error {

	updatedData := make(map[string]interface{})
	if usersetting.UserNo == 0 {
		return errors.New("ユーザNoがありません。")
	}
	updatedData["user_no"] = usersetting.UserNo

	// フィールドが空でない場合に、更新データに追加する
	updatedData["user_no"] = usersetting.UserNo
	updatedData["exclude_after_date"] = usersetting.ExcludeAfterDate
	updatedData["auto_fee_allocation_category_id"] = usersetting.AutoFeeAllocationCategoryID
	updatedData["auto_fee_allocation_subcategory_id"] = usersetting.AutoFeeAllocationSubcategoryID
	updatedData["auto_fee_allocation_assets_id"] = usersetting.AutoFeeAllocationAssetsID
	updatedData["default_transaction_display"] = usersetting.DefaultTransactionDisplay
	updatedData["default_transaction_type"] = usersetting.DefaultTransactionType
	updatedData["month_start_date"] = usersetting.MonthStartDate
	updatedData["week_start_day"] = usersetting.WeekStartDay
	updatedData["show_zero_amount_items"] = usersetting.ShowZeroAmountItems
	updatedData["update_time"] = time.Now() // 現在の時刻を設定

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&usersetting).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating usersetting with usersettingname %b: %v", usersetting.UserNo, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil
}

func GetUserSetting(UserNo int) ([]models.UserSetting, error) {
	var usersettingInfomations []models.UserSetting

	if err := utils.DB.Table("user_settings").
		Select(`
        user_settings.exclude_after_date, 
        user_settings.auto_fee_allocation_category_id, 
        user_settings.auto_fee_allocation_subcategory_id, 
        user_settings.auto_fee_allocation_assets_id, 
        user_settings.default_transaction_display, 
        user_settings.default_transaction_type, 
        user_settings.month_start_date, 
        user_settings.week_start_day, 
        user_settings.show_zero_amount_items
    `).
		Where("user_settings.user_no = ?", UserNo).
		Scan(&usersettingInfomations).Error; err != nil {
		log.Printf("ユーザー設定情報の取得に失敗しました。UserNo: %d, Error: %v", UserNo, err)
		return nil, err
	}
	return usersettingInfomations, nil
}
