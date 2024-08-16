package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func AssetsRegister(c *gin.Context) {
	var assets models.Assets

	// JSONを構造体にバインド
	if err := c.ShouldBindJSON(&assets); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

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
	assets.BookID = convint

	errflg := repository.CheckAssetsConflicting(assets)

	log.Printf("チェック結果: " + strconv.Itoa(int(errflg)))
	if errflg == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が重複しています。"})
		log.Printf("エラーしたよ♡")
		return
	} else if errflg == 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
		return
	}
	log.Printf("チェック後処理")

	if err := repository.CreateAssets(&assets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ログの作成に失敗ました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。"})
}

func GetAssetsAll(c *gin.Context) {
	// CookieからbookIDを取得
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

	assetses, err := repository.GetAssetsAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": assetses})
}
