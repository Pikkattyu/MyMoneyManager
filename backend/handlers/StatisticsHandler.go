package handlers

import (
	"MyMoneyManager/backend/repository"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetStatisticsAll(c *gin.Context) {
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
	if month == 12 {
		month = 1
	} else {
		month += 1
	}
	for {
		if nextMonthDate.Month() == month {
			break
		}
		// 月の範囲外の日付は、日付を1日ずつ減らして調整する
		nextMonthDate = nextMonthDate.AddDate(0, 0, -1)
	}

	transactions, err := repository.GetTransactionInfomationMonth(convint, nowMonthDate, nextMonthDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	beforetransactions, err := repository.GetTransactionInfomationMonth(convint, nowMonthDate.AddDate(0, -1, 0), nowMonthDate.AddDate(0, 0, -1))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transaction": transactions, "beforetransaction": beforetransactions})
}
