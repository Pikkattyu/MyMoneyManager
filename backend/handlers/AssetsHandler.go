package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"net/http"
	"strconv"
	"time"

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

	if errflg == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が重複しています。"})
		return
	} else if errflg == 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
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

func GetAssets(c *gin.Context) {
	assetsID := c.Query("AssetsID")

	convint, err := strconv.Atoi(assetsID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	assetses, err := repository.GetAssets(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": assetses})
}
func ChangeAssets(c *gin.Context) {
	var requestBody map[string]interface{}
	assets := models.Assets{} // ポインタの初期化

	// リクエストボディをバインド
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	tag, ok := requestBody["tag"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "tag の型が不正です"})
		return
	}

	assetsName, ok := requestBody["assetsName"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "assetsName の型が不正です"})
		return
	}

	flg, ok := requestBody["flg"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "flg の型が不正です"})
		return
	}

	AssetsID, ok := requestBody["AssetsID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "AssetsID の型が不正です"})
		return
	}

	userNo, ok := requestBody["userNo"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "userNo の型が不正です"})
		return
	}

	Amount, ok := requestBody["Amount"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Amount の型が不正です"})
		return
	}

	Excluded, ok := requestBody["Excluded"].(bool)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Excluded の型が不正です"})
		return
	}

	UpdateTime, ok := requestBody["UpdateTime"].(time.Time)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "UpdateTime の型が不正です"})
		return
	}

	assets.Tag = tag
	assets.AssetsName = assetsName
	assets.Tag = tag
	assets.UserNo = int(userNo)
	assets.Amount = int(Amount)
	assets.Excluded = Excluded
	assets.Flg = int(flg)
	assets.AssetsID = int(AssetsID)
	assets.UpdateTime = UpdateTime

	errflg := repository.CheckAssetsConflicting(assets)
	if errflg == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が重複しています。"})
		return
	} else if errflg == 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
		return
	}

	errflg = repository.CheckAssetsUpdate(assets.AssetsID, assets.UpdateTime)
	if errflg == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が重複しています。"})
		return
	} else if errflg == 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
		return
	}

	err := repository.UpdateAssets(assets)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "資産情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "資産情報が更新されました。"})
}
