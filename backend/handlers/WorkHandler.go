package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func WorkRegister(c *gin.Context) {
	var work *models.Work

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

	if err := c.ShouldBindJSON(&work); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	work.UpdateUserNo = cuserNo_int
	work.BookID = convint
	work.UserNo = cuserNo_int

	if err := repository.CreateWork(work); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メモの作成に失敗ました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。"})
}

func GetWork(c *gin.Context) {
	workID := c.Query("workID")

	convint, err := strconv.Atoi(workID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	work, err := repository.GetWork(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": work[0]})
}

func GetWorkAll(c *gin.Context) {
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

	work, err := repository.GetWorkAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"work": work})
}

func ChangeWork(c *gin.Context) {
	work := models.Work{} // ポインタの初期化

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

	if err := c.ShouldBindJSON(&work); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	work.UpdateUserNo = cuserNo_int

	err1 := repository.UpdateWork(work)
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "資産情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "資産情報が更新されました。"})
}

func DelWork(c *gin.Context) {
	work := models.Work{} // ポインタの初期化

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

	// bodyの取り出し
	if err := c.ShouldBindJSON(&work); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	work.DelFlg = true
	work.UpdateUserNo = cuserNo_int

	err1 := repository.UpdateWork(work)
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "資産情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "資産情報が更新されました。"})
}
