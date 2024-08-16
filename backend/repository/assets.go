package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"log"
)

// 資産情報の作成
func CreateAssets(assets *models.Assets) error {
	if err := utils.DB.Create(assets).Error; err != nil {
		log.Printf("資産情報を作成に失敗しました。")
		return err
	}
	return nil
}

// GetAssetsByAssetsname retrieves a assets by their assetsname from the database
func GetAssets(AssetsID int, UserNo int) ([]models.Assets, error) {
	var assets []models.Assets

	if err := utils.DB.Where("assets_id = ?", AssetsID).Find(&assets).Error; err != nil {
		log.Printf("資産情報の取得に失敗しました。", AssetsID, err)
		return nil, err
	}
	return assets, nil
}

func GetAssetsAll(BookID int) ([]models.AssetWithUserName, error) {
	var assets []models.AssetWithUserName

	if err := utils.DB.Table("assets").
		Select("assets.*, users.user_name").
		Joins("left join users on assets.user_no = users.user_no").
		Where("assets.book_id = ? AND assets.flg != 2", BookID).
		Order("assets.user_no").
		Find(&assets).Error; err != nil {
		log.Printf("資産情報の取得に失敗しました。", BookID, err)
		return nil, err
	}
	return assets, nil
}

// 重複チェック用
func CheckAssetsConflicting(assets models.Assets) int64 {
	var count int64

	// 条件に基づいて件数をカウント
	err := utils.DB.Table("assets").
		Where("book_id = ? AND user_no = ? AND assets_name = ? AND flg != 2", assets.BookID, assets.UserNo, assets.AssetsName).
		Count(&count).Error

	if err != nil {
		log.Printf("資産情報の取得に失敗しました。BookID: %d, UserNo: %d, AssetsName: %s, Error: %v", assets.BookID, assets.UserNo, assets.AssetsName, err)
		return 2
	}

	return count
}
