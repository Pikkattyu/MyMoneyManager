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

	//bodyの取り出し
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	flg, ok := requestBody["Flg"].(int)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Flg の型が不正です"})
		return
	}

	memo, ok := requestBody["Memo"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Memo の型が不正です"})
		return
	}

	date, ok := requestBody["Date"].(time.Time)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Date の型が不正です"})
		return
	}

	amount, ok := requestBody["Amount"].(int)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Amount の型が不正です"})
		return
	}

	assetsID, ok := requestBody["AssetsID"].(int)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsID の型が不正です"})
		return
	}

	assetsUpdateTime, ok := requestBody["AssetsUpdateTime"].(time.Time)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsUpdateTime の型が不正です"})
		return
	}

	// 更新チェック
	assetsFlg := repository.CheckAssetsUpdate(assetsID, assetsUpdateTime)
	if assetsFlg == -1 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が更新されています。再度やり直してください。"})
		return
	} else if assetsFlg == -2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
		return
	}

	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("UserNo")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。"})
		return
	}

	//文字を数字に変換
	cuserNo_int, err := strconv.Atoi(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}
	// CookieからUserIDを取得
	BookIDCookie, err := c.Cookie("BookID")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。"})
		return
	}

	//文字を数字に変換
	BookID_int, err := strconv.Atoi(BookIDCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	// UserIDを取得
	transaction.UpdateUserNo = cuserNo_int
	transaction.RegisterUserNo = cuserNo_int
	transaction.BookID = BookID_int
	transaction.Kind = flg
	transaction.Date = date
	transaction.Memo = memo

	if flg != 2 {
		categoryID, ok := requestBody["CategoryID"].(int)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "CategoryID の型が不正です"})
			return
		}

		categoryUpdateTime, ok := requestBody["CategoryUpdateTime"].(time.Time)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "CategoryUpdateTime の型が不正です"})
			return
		}

		// 更新チェック
		errflg := repository.CheckCategoryUpdate(categoryID, categoryUpdateTime)
		if errflg == 1 {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリが更新されています。再度やり直してください。"})
			return
		} else if errflg == 2 {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリの取得に失敗しました。"})
			return
		}

		subcategoryID, ok := requestBody["SubcategoryID"].(int)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "SubcategoryID の型が不正です"})
			return
		}

		subcategoryUpdateTime, ok := requestBody["SubcategoryUpdateTime"].(time.Time)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "SubcategoryUpdateTime の型が不正です"})
			return
		}

		// 更新チェック
		errflgSub := repository.CheckSubcategoryUpdate(subcategoryID, subcategoryUpdateTime)
		if errflgSub == 1 {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリが更新されています。再度やり直してください。"})
			return
		} else if errflgSub == 2 {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリの取得に失敗しました。"})
			return
		}

		transaction.CategoryID = categoryID
		transaction.SubcategoryID = subcategoryID
	}

	// 帳簿を新規作成
	retransaction, err := repository.CreateTransaction(&transaction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿作成時にエラーが発生しました。"})
		return
	}

	var transaction_infomation *models.TransactionInfomation
	transaction_infomation.TransactionID = retransaction.TransactionID
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
	transaction_infomation.Amount = amount

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

		assets2UpdateTime, ok := requestBody["Assets2UpdateTime"].(time.Time)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Assets2UpdateTime の型が不正です"})
			return
		}

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

/*
func GetTransactions(c *gin.Context) {
	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("UserNo")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。"})
		return
	}

	convint, err := strconv.Atoi(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	// UserNoに基づいて帳簿を取得
	transactions, err := repository.GetTransactionsByUserNo(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	user, err := repository.GetUserByUserNo(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": transactions, "user": user.TransactionID})
}
*/

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

	c.JSON(http.StatusOK, gin.H{"transaction": transactions, "assets": assets, "transactionall": transactionAll})
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
