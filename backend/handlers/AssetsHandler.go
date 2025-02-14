package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func AssetsRegister(c *gin.Context) {
	var assets models.Assets

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
	assets.UpdateUserNo = cuserNo_int

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

	transactions, err := repository.GetTransactionInfomationGroup(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": assetses, "transactions": transactions})
}

func GetAssets(c *gin.Context) {
	assetsID := c.Query("AssetsID")

	convint, err := strconv.Atoi(assetsID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	assets, err := repository.GetAssets(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報取得時にエラーが発生しました。"})
		return
	}

	// CookieからbookIDを取得
	BookID, err := c.Cookie("bookID")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	book, err := repository.GetBookByBookname(BookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿情報取得時にエラーが発生しました。"})
		return
	}

	inputString := book.AttendUserNos
	const chunkSize = 10
	var result []string

	// 10桁ごとに区切る
	for i := 0; i < len(inputString); i += chunkSize {
		end := i + chunkSize
		if end > len(inputString) {
			end = len(inputString)
		}
		chunk := inputString[i:end]
		// 空白を除く
		chunk = strings.TrimRight(chunk, " ")
		result = append(result, chunk)
	}

	users, err := repository.GetUsersByUserNos(result)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": assets[0], "users": users})
}

func ChangeAssets(c *gin.Context) {
	var requestBody map[string]interface{}
	assets := models.Assets{} // ポインタの初期化

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

	UpdateTime := requestBody["UpdateTime"].(string)
	parsedTime, state := time.Parse(time.RFC3339, UpdateTime)
	if state != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "UpdateTime の型が不正です"})
		return
	}

	iconpath, ok := requestBody["IconPath"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "IconPath の型が不正です"})
		return
	}

	backgroundcolor, ok := requestBody["Backgroundcolor"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Backgroundcolor の型が不正です"})
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
	assets.UpdateTime = parsedTime
	assets.UpdateUserNo = cuserNo_int
	assets.IconPath = iconpath
	assets.Backgroundcolor = backgroundcolor

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
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
		return
	} else if errflg == 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が更新されています。再度やり直してください。"})
		return
	}

	errtrn := repository.UpdateAssets(assets)
	if errtrn != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "資産情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "資産情報が更新されました。"})
}

func DelAssets(c *gin.Context) {
	var requestBody map[string]interface{}
	assets := models.Assets{} // ポインタの初期化

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

	assetsID, ok := requestBody["AssetsID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "dateS の型が不正です"})
		return
	}

	assets.AssetsID = int(assetsID)
	assets.DelFlg = true
	assets.UpdateUserNo = cuserNo_int

	err1 := repository.UpdateAssets(assets)
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "資産情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "資産情報が更新されました。"})
}
