package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
	"time"
)

// 入出金履歴情報の作成
func CreateTransaction(transaction *models.Transaction) (int, error) {
	if err := utils.DB.Create(transaction).Error; err != nil {
		log.Printf("入出金履歴情報の作成に失敗しました。")
		return 0, err
	}
	log.Printf("挿入後のTransactionID: %d", transaction.TransactionID)
	return transaction.TransactionID, nil
}

// 入出金履歴詳細情報の作成
func CreateTransactionInfomation(transactioninfomation *models.TransactionInfomation) error {
	if err := utils.DB.Create(transactioninfomation).Error; err != nil {
		log.Printf("入出金履歴詳細情報の作成に失敗しました。")
		return err
	}
	return nil
}

// 入出金履歴情報の更新
func UpdateTransaction(transaction *models.Transaction) error {

	updatedData := make(map[string]interface{})
	if transaction.TransactionID == 0 {
		return errors.New("トランザクションIDがありません。")
	}
	if transaction.UpdateUserNo == 0 {
		return errors.New("更新者が不明です。")
	}
	updatedData["update_user_no"] = transaction.UpdateUserNo
	updatedData["transaction_id"] = transaction.TransactionID

	if transaction.DelFlg {
		updatedData["del_flg"] = transaction.DelFlg
	} else {
		// フィールドが空でない場合に、更新データに追加する
		if transaction.Memo != "" {
			updatedData["memo"] = transaction.Memo
		}
		if transaction.Kind != 0 {
			updatedData["kind"] = transaction.Kind
		}
		if !transaction.Date.IsZero() {
			updatedData["date"] = transaction.Date
		}
		updatedData["category_id"] = transaction.CategoryID
		updatedData["subcategory_id"] = transaction.SubcategoryID
	}
	updatedData["update_time"] = time.Now()

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&transaction).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating transaction with transactionname %b: %v", transaction.TransactionID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil
}

// 入出金履歴情報の更新
func UpdateTransactionInfomation(transaction *models.TransactionInfomation) error {

	updatedData := make(map[string]interface{})
	if transaction.TransactionInfomationID == 0 {
		return errors.New("トランザクションインフォメーションIDがありません。")
	}
	updatedData["transaction_infomation_id"] = transaction.TransactionInfomationID

	if transaction.DelFlg {
		updatedData["del_flg"] = transaction.DelFlg
	} else {
		// フィールドが空でない場合に、更新データに追加する
		if transaction.AssetsID != 0 {
			updatedData["assets_id"] = transaction.AssetsID
		}
		if transaction.Flg != 0 {
			updatedData["flg"] = transaction.Flg
		}
		updatedData["amount"] = transaction.Amount
	}

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&transaction).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating transaction with transactionname %b: %v", transaction.TransactionID, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil
}

func GetTransactionInfomationAll(BookID int) ([]models.Transaction_Infomation, error) {
	var transactionInfomations []models.Transaction_Infomation

	if err := utils.DB.Table("transaction_infomations t1").
		Select(`
            SUM(t1.amount) AS amount, 
            t1.flg, 
            t2.kind
        `).
		Joins("INNER JOIN transactions t2 ON t1.transaction_id = t2.transaction_id").
		Where("t2.kind <> 2 AND t2.book_id = ?", BookID).
		Group("t1.flg, t2.kind").
		Order("t1.flg ASC").
		Scan(&transactionInfomations).Error; err != nil {
		log.Printf("取引情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}

	return transactionInfomations, nil
}

func GetTransactionInfomationMonth(BookID int, startDate time.Time, endDate time.Time) ([]models.Transaction_Infomation, error) {
	var transactionInfomations []models.Transaction_Infomation

	if err := utils.DB.Table("transactions").
		Select(`
            transactions.transaction_id, 
            transactions.category_id, 
            transactions.memo, 
            transactions.kind, 
            transactions.date,
            transactions.update_time, 
            transaction_infomations.transaction_infomation_id, 
            transaction_infomations.amount, 
            transaction_infomations.flg, 
            transaction_infomations.assets_id,
            assets.assets_name,
            assets.user_no,
            users.user_name,
            categories.category_name,
            subcategories.subcategory_id, 
            subcategories.subcategory_name
        `).
		Joins("INNER JOIN transaction_infomations ON transactions.transaction_id = transaction_infomations.transaction_id").
		Joins("LEFT JOIN assets ON transaction_infomations.assets_id = assets.assets_id").
		Joins("LEFT JOIN categories ON transactions.category_id = categories.category_id").
		Joins("LEFT JOIN subcategories ON transactions.subcategory_id = subcategories.subcategory_id").
		Joins("LEFT JOIN users ON users.user_no = assets.user_no").
		Where("transactions.book_id = ? AND transactions.date >= ? AND transactions.date <= ?", BookID, startDate, endDate).
		Order("transactions.date DESC, transactions.transaction_id DESC, transaction_infomations.transaction_infomation_id DESC").
		Scan(&transactionInfomations).Error; err != nil {
		log.Printf("取引情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return transactionInfomations, nil
}

func GetTransaction(transactionID int) ([]models.Transaction_Infomation, error) {
	var transactionInfomations []models.Transaction_Infomation
	if err := utils.DB.Table("transactions t").
		Select(`
        t.transaction_id,
        t.kind,
        t.memo,
        t.category_id,
        t.subcategory_id,
        t.date,
        t.update_time,
        ti.transaction_infomation_id,
        ti.assets_id,
        ti.amount,
        ti.flg
    `).
		Joins("INNER JOIN transaction_infomations ti ON t.transaction_id = ti.transaction_id").
		Where("ti.transaction_id = ? AND ti.del_flg = false AND t.del_flg = false", transactionID).
		Order("ti.transaction_infomation_id ASC").
		Scan(&transactionInfomations).
		Error; err != nil {
		log.Printf("取引情報の取得に失敗しました。TransactionID: %d, Error: %v", transactionID, err)
		return nil, err
	}

	return transactionInfomations, nil
}

func GetTransactionInfomationGroup(BookID int) ([]models.Transaction_Infomation, error) {
	var transactionInfomation []models.Transaction_Infomation

	if err := utils.DB.Table("transactions t").
		Select("t.kind, ti.assets_id, SUM(ti.amount) AS amount, ti.flg").
		Joins("INNER JOIN transaction_infomations ti ON t.transaction_id = ti.transaction_id").
		Where("t.book_id = ? AND ti.del_flg = false AND t.del_flg = false AND ti.assets_id <> 0", BookID).
		Group("t.kind, ti.assets_id, ti.flg").
		Order("ti.assets_id ASC").
		Find(&transactionInfomation).Error; err != nil {
		log.Printf("取引情報の取得に失敗しました。 BookID: %d, Error: %v", BookID, err)
		return nil, err
	}
	return transactionInfomation, nil
}
