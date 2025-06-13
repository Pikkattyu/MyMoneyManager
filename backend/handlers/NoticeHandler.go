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

func NoticeRegister(c *gin.Context) {
	var notice *models.Notice

	// CookieからUserIDを取得（数字返還）)
	BookID, err := c.Cookie("bookID")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿IDの取得に失敗しました。"})
		return
	}

	convint, err := strconv.Atoi(BookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

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

	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	notice.UpdateUserNo = cuserNo_int
	notice.BookID = convint

	if err := repository.CreateNotice(notice); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メモの作成に失敗ました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。"})
}

func GetNotice(c *gin.Context) {
	noticeID := c.Query("NoticeID")

	convint, err := strconv.Atoi(noticeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	notice, err := repository.GetNotice(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": notice[0]})
}

func GetNoticeDate(c *gin.Context) {
	// CookieからUserIDを取得（数字返還）)
	BookID, err := c.Cookie("bookID")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿IDの取得に失敗しました。"})
		return
	}

	convint, err := strconv.Atoi(BookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	today := time.Now().Format("2006-01-02")

	notice, err := repository.GetNoticeDate(convint, today)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notice": notice})
}

func GetNoticeAll(c *gin.Context) {
	// CookieからUserIDを取得（数字返還）)
	BookID, err := c.Cookie("bookID")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿IDの取得に失敗しました。"})
		return
	}

	convint, err := strconv.Atoi(BookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	notice, err := repository.GetNoticeAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notice": notice})
}

func ChangeNotice(c *gin.Context) {
	notice := models.Notice{} // ポインタの初期化

	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("userNo")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。?: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。?"})
		return
	}

	// 文字を数字に変換
	cuserNo_int, err := strconv.Atoi(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	notice.UpdateUserNo = cuserNo_int

	err1 := repository.UpdateNotice(notice)
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "資産情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "資産情報が更新されました。"})
}
