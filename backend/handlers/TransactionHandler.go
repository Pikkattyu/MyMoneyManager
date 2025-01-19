package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func TransactionRegister(c *gin.Context) {
	var requestBody map[string]interface{}
	var transaction models.Transaction
	transaction_infomation := &models.TransactionInfomation{}

	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("userNo")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。?: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。?"})
		return
	}

	//文字を数字に変換
	cuserNo_int, err := strconv.Atoi(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}
	// CookieからUserIDを取得
	BookIDCookie, err := c.Cookie("bookID")
	if err != nil {
		log.Printf("bookIDの取得に失敗しました。: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "bookIDの取得に失敗しました。"})
		return
	}

	//文字を数字に変換
	BookID_int, err := strconv.Atoi(BookIDCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	//bodyの取り出し
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	flg, ok := requestBody["Flg"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Flg の型が不正です"})
		return
	}

	memo, ok := requestBody["Memo"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Memo の型が不正です"})
		return
	}

	dateS, ok := requestBody["Date"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "dateS の型が不正です"})
		return
	}
	date, state := time.Parse(time.RFC3339, dateS)
	if state != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "date の型が不正です"})
		return
	}

	amount, ok := requestBody["Amount"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Amount の型が不正です"})
		return
	}

	assetsID, ok := requestBody["AssetsID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsID の型が不正です"})
		return
	}

	assetsFlg := 0
	if assetsID != 0 {
		assetsUpdateTimeS, ok := requestBody["AssetsUpdateTime"].(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsUpdateTime の型が不正です"})
			return
		}
		assetsUpdateTime, state := time.Parse(time.RFC3339, assetsUpdateTimeS)
		if state != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsUpdateTimeS の型が不正です"})
			return
		}

		// 更新チェック
		assetsFlg = int(repository.CheckAssetsUpdate(int(assetsID), assetsUpdateTime))
		if assetsFlg == -1 {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が更新されています。再度やり直してください。"})
			return
		} else if assetsFlg == -2 {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
			return
		}
		transaction_infomation.AssetsID = int(assetsID)
	}

	// UserIDを取得
	transaction.UpdateUserNo = cuserNo_int
	transaction.RegisterUserNo = cuserNo_int
	transaction.BookID = BookID_int
	transaction.Kind = int(flg)
	transaction.Date = date
	transaction.Memo = memo

	if flg != 2 {
		categoryID, ok := requestBody["CategoryID"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "CategoryID の型が不正です"})
			return
		}

		if categoryID != 0 {
			CategoryUpdateTimeS, ok := requestBody["CategoryUpdateTime"].(string)
			if !ok {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "CategoryUpdateTime の型が不正です"})
				return
			}
			categoryUpdateTime, state := time.Parse(time.RFC3339, CategoryUpdateTimeS)
			if state != nil {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "CategoryUpdateTimeS の型が不正です"})
				return
			}

			// 更新チェック
			errflg := repository.CheckCategoryUpdate(int(categoryID), categoryUpdateTime)
			if errflg == 1 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリが更新されています。再度やり直してください。"})
				return
			} else if errflg == 2 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリの取得に失敗しました。"})
				return
			}
		}

		subcategoryID, ok := requestBody["SubcategoryID"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "SubcategoryID の型が不正です"})
			return
		}

		if subcategoryID != 0 {
			subcategoryUpdateTimeS, ok := requestBody["SubcategoryUpdateTime"].(string)
			if !ok {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "SubcategoryUpdateTime の型が不正です"})
				return
			}
			subcategoryUpdateTime, state := time.Parse(time.RFC3339, subcategoryUpdateTimeS)
			if state != nil {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "UpdateTime の型が不正です"})
				return
			}

			// 更新チェック
			errflgSub := repository.CheckSubcategoryUpdate(int(subcategoryID), subcategoryUpdateTime)
			if errflgSub == 1 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリが更新されています。再度やり直してください。"})
				return
			} else if errflgSub == 2 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリの取得に失敗しました。"})
				return
			}
		}

		transaction.CategoryID = int(categoryID)
		transaction.SubcategoryID = int(subcategoryID)
	}

	// 帳簿を新規作成
	retransactionID, err := repository.CreateTransaction(&transaction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "入出金履歴情報作成時にエラーが発生しました。"})
		return
	}

	transaction_infomation.TransactionID = retransactionID

	if flg == 2 {
		if assetsFlg == 0 {
			transaction_infomation.Flg = 0
		} else {
			transaction_infomation.Flg = 1
		}
	} else {
		if flg == 0 {
			if assetsFlg == 0 {
				transaction_infomation.Flg = 0
			} else {
				transaction_infomation.Flg = 1
			}
		} else {
			if assetsFlg == 0 {
				transaction_infomation.Flg = 1
			} else {
				transaction_infomation.Flg = 0
			}
		}
	}
	transaction_infomation.Amount = int(amount)

	err = repository.CreateTransactionInfomation(transaction_infomation)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。"})
		return
	}

	if flg == 2 {

		assets2ID, ok := requestBody["Assets2ID"].(int)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Assets2ID の型が不正です"})
			return
		}

		assets2UpdateTimeS, ok := requestBody["Assets2UpdateTime"].(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Assets2UpdateTime の型が不正です"})
			return
		}
		assets2UpdateTime, state := time.Parse(time.RFC3339, assets2UpdateTimeS)
		if state != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AategoryUpdateTimeS の型が不正です"})
			return
		}

		if assets2ID != 0 {
			// 更新チェック
			assetsFlg := repository.CheckAssetsUpdate(assets2ID, assets2UpdateTime)
			if assetsFlg == -1 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が更新されています。再度やり直してください。"})
				return
			} else if assetsFlg == -2 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
				return
			}

			if assetsFlg == 0 {
				transaction_infomation.Flg = 0
			} else {
				transaction_infomation.Flg = 1
			}
		}

		amount2, ok := requestBody["Amount2"].(int)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Amount2 の型が不正です"})
			return
		}
		transaction_infomation.Amount = amount2

		err = repository.CreateTransactionInfomation(transaction_infomation)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。"})
}

func GetTransactionsAll(c *gin.Context) {
	// CookieからUserIDを取得
	BookIDCookie, err := c.Cookie("bookID")
	if err != nil {
		log.Printf("BookIDの取得に失敗しました。: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "bookIDの取得に失敗しました。"})
		return
	}

	convint, err := strconv.Atoi(BookIDCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	// BookIDに基づいて帳簿を取得
	startDay, err := repository.GetStartBookDay(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	getDate := c.Query("date")

	year, err := strconv.Atoi(getDate[:4])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	monthInt, err := strconv.Atoi(getDate[4:])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	month := time.Month(monthInt)
	// 初期の年月日を作成する（時間、分、秒、ナノ秒を0に設定）
	initialDate := time.Date(year, month, startDay, int(0), int(0), int(0), int(0), time.UTC)

	// 作成できる日付まで引く処理
	nowMonthDate := initialDate
	for {
		if nowMonthDate.Month() == month {
			break
		}
		// 月の範囲外の日付は、日付を1日ずつ減らして調整する
		nowMonthDate = nowMonthDate.AddDate(0, 0, -1)
	}

	// 作成できる日付まで引く処理
	nextMonthDate := initialDate.AddDate(0, 1, 0)
	for {
		if nextMonthDate.Month() == month+1 {
			break
		}
		// 月の範囲外の日付は、日付を1日ずつ減らして調整する
		nextMonthDate = nextMonthDate.AddDate(0, 0, -1)
	}

	// BookIDに基づいて帳簿を取得
	transactions, err := repository.GetTransactionInfomationMonth(convint, nowMonthDate, nextMonthDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	// BookIDに基づいて帳簿を取得
	memos, err := repository.GetMemoMonth(convint, nowMonthDate, nextMonthDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "メモの取得時にエラーが発生しました。"})
		return
	}

	// BookIDに基づいて帳簿を取得
	transactionAll, err := repository.GetTransactionInfomationAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	// BookIDに基づいて帳簿を取得
	assets, err := repository.GetAssetsSUM(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transaction": transactions, "assets": assets, "transactionall": transactionAll, "memo": memos})
}

func GetTransactionsRelation(c *gin.Context) {
	BookID, err := c.Cookie("bookID")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	convint, err := strconv.Atoi(BookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	categories, err := repository.GetCategoryAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報取得時にエラーが発生しました。"})
		return
	}

	assetses, err := repository.GetAssetsAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"category": categories, "assets": assetses})
}

func DelTransaction(c *gin.Context) {
	var requestBody map[string]interface{}
	var transaction *models.Transaction

	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("userNo")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。?: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。?"})
		return
	}

	//文字を数字に変換
	cuserNo_int, err := strconv.Atoi(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	//bodyの取り出し
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	transactionID, ok := requestBody["TransactionID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "TransactionID の型が不正です"})
		return
	}
	transaction = &models.Transaction{}
	transaction.TransactionID = int(transactionID)
	transaction.UpdateUserNo = int(cuserNo_int)
	transaction.DelFlg = true

	errm := repository.UpdateTransaction(transaction)
	if errm != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "取引情報更新時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"Message": "削除しました。"})
}

func ChangeTransaction(c *gin.Context) {
	var requestBody map[string]interface{}
	var transaction models.Transaction
	transaction_infomation := &models.TransactionInfomation{}

	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("userNo")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。?: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。?"})
		return
	}

	//文字を数字に変換
	cuserNo_int, err := strconv.Atoi(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}
	// CookieからUserIDを取得
	BookIDCookie, err := c.Cookie("bookID")
	if err != nil {
		log.Printf("bookIDの取得に失敗しました。: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "bookIDの取得に失敗しました。"})
		return
	}

	//文字を数字に変換
	BookID_int, err := strconv.Atoi(BookIDCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	//bodyの取り出し
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	beforeflg, ok := requestBody["BeforeFlg"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "BeforeFlg の型が不正です"})
		return
	}

	transactionID, ok := requestBody["TransactionID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "TransactionID の型が不正です"})
		return
	}

	transactioninfomationID, ok := requestBody["TransactionInfomationID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "TransactionInfomationID の型が不正です"})
		return
	}

	flg, ok := requestBody["Flg"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Flg の型が不正です"})
		return
	}

	memo, ok := requestBody["Memo"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Memo の型が不正です"})
		return
	}

	dateS, ok := requestBody["Date"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "dateS の型が不正です"})
		return
	}
	date, state := time.Parse(time.RFC3339, dateS)
	if state != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "date の型が不正です"})
		return
	}

	amount, ok := requestBody["Amount"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Amount の型が不正です"})
		return
	}

	assetsID, ok := requestBody["AssetsID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsID の型が不正です"})
		return
	}

	assetsFlg := 0
	if assetsID != 0 {
		assetsUpdateTimeS, ok := requestBody["AssetsUpdateTime"].(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsUpdateTime の型が不正です"})
			return
		}
		assetsUpdateTime, state := time.Parse(time.RFC3339, assetsUpdateTimeS)
		if state != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsUpdateTimeS の型が不正です"})
			return
		}

		// 更新チェック
		assetsFlg = int(repository.CheckAssetsUpdate(int(assetsID), assetsUpdateTime))
		if assetsFlg == -1 {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が更新されています。再度やり直してください。"})
			return
		} else if assetsFlg == -2 {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
			return
		}
		transaction_infomation.AssetsID = int(assetsID)
	} else {
		transaction_infomation.AssetsID = 0
	}

	transaction_infomation.TransactionInfomationID = int(transactioninfomationID)

	// UserIDを取得
	transaction.TransactionID = int(transactionID)
	transaction.UpdateUserNo = cuserNo_int
	transaction.BookID = BookID_int
	transaction.Kind = int(flg)
	transaction.Date = date
	transaction.Memo = memo

	if flg != 2 {
		categoryID, ok := requestBody["CategoryID"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "CategoryID の型が不正です"})
			return
		}

		if categoryID != 0 {
			CategoryUpdateTimeS, ok := requestBody["CategoryUpdateTime"].(string)
			if !ok {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "CategoryUpdateTime の型が不正です"})
				return
			}
			categoryUpdateTime, state := time.Parse(time.RFC3339, CategoryUpdateTimeS)
			if state != nil {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "CategoryUpdateTimeS の型が不正です"})
				return
			}

			// 更新チェック
			errflg := repository.CheckCategoryUpdate(int(categoryID), categoryUpdateTime)
			if errflg == 1 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリが更新されています。再度やり直してください。"})
				return
			} else if errflg == 2 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリの取得に失敗しました。"})
				return
			}
			transaction.CategoryID = int(categoryID)
		} else {
			transaction.CategoryID = 0
		}

		subcategoryID, ok := requestBody["SubcategoryID"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "SubcategoryID の型が不正です"})
			return
		}

		if subcategoryID != 0 {
			subcategoryUpdateTimeS, ok := requestBody["SubcategoryUpdateTime"].(string)
			if !ok {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "SubcategoryUpdateTime の型が不正です"})
				return
			}
			subcategoryUpdateTime, state := time.Parse(time.RFC3339, subcategoryUpdateTimeS)
			if state != nil {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "UpdateTime の型が不正です"})
				return
			}

			// 更新チェック
			errflgSub := repository.CheckSubcategoryUpdate(int(subcategoryID), subcategoryUpdateTime)
			if errflgSub == 1 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリが更新されています。再度やり直してください。"})
				return
			} else if errflgSub == 2 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリの取得に失敗しました。"})
				return
			}
			transaction.SubcategoryID = int(subcategoryID)
		} else {
			transaction.CategoryID = 0
			transaction.SubcategoryID = 0
		}

	}

	// 帳簿を新規作成
	err = repository.UpdateTransaction(&transaction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "入出金履歴情報作成時にエラーが発生しました。"})
		return
	}

	if flg == 2 {
		if assetsFlg == 0 {
			transaction_infomation.Flg = 0
		} else {
			transaction_infomation.Flg = 1
		}
	} else {
		if flg == 0 {
			if assetsFlg == 0 {
				transaction_infomation.Flg = 0
			} else {
				transaction_infomation.Flg = 1
			}
		} else {
			if assetsFlg == 0 {
				transaction_infomation.Flg = 1
			} else {
				transaction_infomation.Flg = 0
			}
		}
	}
	transaction_infomation.Amount = int(amount)

	err = repository.UpdateTransactionInfomation(transaction_infomation)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。1"})
		return
	}

	if beforeflg == 2 && flg != beforeflg {
		transactioninfomationID2, ok := requestBody["TransactionInfomationID2"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "TransactionInfomationID2 の型が不正です"})
			return
		}
		transaction_infomation2 := &models.TransactionInfomation{}
		transaction_infomation2.TransactionInfomationID = int(transactioninfomationID2)
		transaction_infomation2.DelFlg = true

		err = repository.CreateTransactionInfomation(transaction_infomation2)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の作成に失敗しました。1"})
			return
		}
	} else if flg == 2 && flg != beforeflg {
		assets2ID, ok := requestBody["Assets2ID"].(int)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Assets2ID の型が不正です"})
			return
		}

		assets2UpdateTimeS, ok := requestBody["Assets2UpdateTime"].(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Assets2UpdateTime の型が不正です"})
			return
		}
		assets2UpdateTime, state := time.Parse(time.RFC3339, assets2UpdateTimeS)
		if state != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AategoryUpdateTimeS の型が不正です"})
			return
		}

		if assets2ID != 0 {
			// 更新チェック
			assetsFlg := repository.CheckAssetsUpdate(assets2ID, assets2UpdateTime)
			if assetsFlg == -1 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が更新されています。再度やり直してください。"})
				return
			} else if assetsFlg == -2 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
				return
			}

			if assetsFlg == 0 {
				transaction_infomation.Flg = 0
			} else {
				transaction_infomation.Flg = 1
			}
		}

		amount2, ok := requestBody["Amount2"].(int)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Amount2 の型が不正です"})
			return
		}
		transaction_infomation.Amount = amount2
		if flg == 2 && flg == beforeflg {
			err = repository.UpdateTransactionInfomation(transaction_infomation)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。2"})
				return
			}
		} else {
			err = repository.CreateTransactionInfomation(transaction_infomation)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の作成に失敗しました。2"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。"})
}

func GetTransaction(c *gin.Context) {

	BookID, err := c.Cookie("bookID")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	convint, err := strconv.Atoi(BookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	categories, err := repository.GetCategoryAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報取得時にエラーが発生しました。"})
		return
	}

	assetses, err := repository.GetAssetsAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	transactionID := c.Query("transactionID")
	log.Printf("transactionID: %s", transactionID)
	convint_td, err := strconv.Atoi(transactionID)
	log.Printf("transactionID2 (int): %d", convint_td)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}
	transaction, err := repository.GetTransaction(convint_td)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"category": categories, "assets": assetses, "transaction": transaction})

}
