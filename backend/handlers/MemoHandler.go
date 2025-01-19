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

func MemoRegister(c *gin.Context) {
	var requestBody map[string]interface{}
	var memo *models.Memo

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

	//bodyの取り出し
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
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

	title, ok := requestBody["Title"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Title の型が不正です"})
		return
	}

	txt, ok := requestBody["Txt"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Txt の型が不正です"})
		return
	}

	memo = &models.Memo{}
	memo.BookID = convint
	memo.Date = date
	memo.Title = title
	memo.Txt = txt
	memo.UpdateUserNo = cuserNo_int
	memo.RegisterUserNo = cuserNo_int

	if err := repository.CreateMemo(memo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "メモの作成に失敗ました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。"})
}

func GetMemo(c *gin.Context) {
	memoID := c.Query("memoID")

	convint, err := strconv.Atoi(memoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	memo, err := repository.GetMemo(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": memo[0]})
}

func ChangeMemo(c *gin.Context) {
	var requestBody map[string]interface{}
	memo := models.Memo{} // ポインタの初期化

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
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	memoID, ok := requestBody["MemoID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "dateS の型が不正です"})
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

	title, ok := requestBody["Title"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Title の型が不正です"})
		return
	}

	txt, ok := requestBody["Txt"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Txt の型が不正です"})
		return
	}

	memo.MemoID = int(memoID)
	memo.Date = date
	memo.Title = title
	memo.Txt = txt
	memo.UpdateUserNo = cuserNo_int

	err1 := repository.UpdateMemo(memo)
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "資産情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "資産情報が更新されました。"})
}

func DelMemo(c *gin.Context) {
	var requestBody map[string]interface{}
	memo := models.Memo{} // ポインタの初期化

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
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	memoID, ok := requestBody["MemoID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "dateS の型が不正です"})
		return
	}

	memo.MemoID = int(memoID)
	memo.Flg = 1
	memo.UpdateUserNo = cuserNo_int

	err1 := repository.UpdateMemo(memo)
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "資産情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "資産情報が更新されました。"})
}
