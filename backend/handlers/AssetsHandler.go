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

	log.Printf("BookID: " + BookID)

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
