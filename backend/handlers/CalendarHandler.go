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

func CalendarRegister(c *gin.Context) {
	var calendar models.Calendar

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
	if err := c.ShouldBindJSON(&calendar); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	// UserIDを取得
	calendar.UpdateUserNo = cuserNo_int
	calendar.BookID = BookID_int

	// 帳簿を新規作成
	reterr := repository.CreateCalendar(&calendar)
	if reterr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "入出金履歴情報作成時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "予定を作成しました。"})
}

func GetCalendarsAll(c *gin.Context) {
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

	// BookIDに基づいて帳簿を取得
	calendars, err := repository.GetCalendarMonth(convint, nowMonthDate, nextMonthDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	// BookIDに基づいて帳簿を取得
	work, err := repository.GetWorkDurations(convint, nowMonthDate.Format("2006-01-02"), nextMonthDate.Format("2006-01-02"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"calendar": calendars, "work": work})
}

func ChangeCalendar(c *gin.Context) {
	var calendar models.Calendar

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
	if err := c.ShouldBindJSON(&calendar); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	// UserIDを取得
	calendar.UpdateUserNo = cuserNo_int
	calendar.BookID = BookID_int

	// 帳簿を新規作成
	err = repository.UpdateCalendar(&calendar)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "予定を更新中に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "予定を更新しました。"})
}

func GetCalendar(c *gin.Context) {

	calendarID := c.Query("calendarID")
	convint_td, err := strconv.Atoi(calendarID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}
	calendar, err := repository.GetCalendar(convint_td)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"calendar": calendar[0]})

}

func SetTemplate(c *gin.Context) {
	var calendars []models.Calendar

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
	if err := c.ShouldBindJSON(&calendars); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	startTimeStr := calendars[0].StartDateTime
	t, err := time.Parse(time.RFC3339, startTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "日付の形式が不正です"})
		return
	}

	// 1日加算
	tPlusOne := t.AddDate(0, 0, 1)

	// YYYY-MM-DD にフォーマット
	startDate := t.Format("2006-01-02")
	endDate := tPlusOne.Format("2006-01-02")

	//削除処理
	if err := repository.UpdateCalendarsInRange(BookID_int, startDate, endDate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "削除失敗しました。"})
		return
	}

	//登録
	for _, calendar := range calendars {
		// UserIDを取得
		calendar.UpdateUserNo = cuserNo_int
		calendar.BookID = BookID_int

		// 帳簿を新規作成
		reterr := repository.CreateCalendar(&calendar)
		if reterr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "入出金履歴情報作成時にエラーが発生しました。"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "予定を作成しました。"})
}
