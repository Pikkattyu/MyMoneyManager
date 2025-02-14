package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateCategory(c *gin.Context) {
	var requestBody map[string]interface{}
	category := &models.Category{} // ポインタの初期化

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

	// リクエストボディをバインド
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	disCategory, ok := requestBody["disCategory"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disCategory の型が不正です"})
		return
	}

	isAssetsView, ok := requestBody["isAssetsView"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "isAssetsView の型が不正です"})
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

	category.CategoryName = disCategory
	category.Flg = int(isAssetsView)
	category.BookID = convint
	category.IconPath = iconpath
	category.Backgroundcolor = backgroundcolor

	errflg := repository.CheckCategoryConflicting(category)
	if errflg == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報が重複しています。"})
		return
	} else if errflg == 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報の取得に失敗しました。"})
		return
	}

	recategory, err := repository.CreateCategory(category)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "カテゴリ情報の更新に失敗しました。"})
		return
	}

	disSubcategoryInterface, ok := requestBody["disSubcategory"].([]interface{})
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disSubcategory の型が不正です"})
		return
	}

	for _, item := range disSubcategoryInterface {
		subcategory := &models.Subcategory{} // ポインタの初期化

		if name, ok := item.(map[string]interface{})["SubcategoryName"].(string); ok {
			subcategory.SubcategoryName = name
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "SubcategoryName の取得に失敗しました"})
			return
		}

		subcategory.CategoryID = recategory.CategoryID
		subcategory.UpdateUserNo = cuserNo_int
		err = repository.CreateSubcategory(subcategory)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の作成に失敗しました。"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "カテゴリ情報が更新されました。"})
}

func GetCategoryAll(c *gin.Context) {
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

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

func GetCategory(c *gin.Context) {
	categoryID := c.Query("CategoryID")

	convint, err := strconv.Atoi(categoryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	categoris, err := repository.GetCategory(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": categoris})
}

func ChangeCategory(c *gin.Context) {
	var requestBody map[string]interface{}
	category := &models.Category{} // ポインタの初期化

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

	// リクエストボディをバインド
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "無効なリクエストデータ"})
		return
	}

	disCategory, ok := requestBody["disCategory"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disCategory の型が不正です"})
		return
	}

	categoryID, ok := requestBody["CategoryID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disCategory の型が不正です"})
		return
	}

	isAssetsView, ok := requestBody["isAssetsView"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "isAssetsView の型が不正です"})
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

	category.CategoryName = disCategory
	category.Flg = int(isAssetsView)
	category.BookID = convint
	category.CategoryID = int(categoryID)
	category.IconPath = iconpath
	category.Backgroundcolor = backgroundcolor

	errflg := repository.CheckCategoryConflicting(category)
	if errflg == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報が重複しています。"})
		return
	} else if errflg == 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報の取得に失敗しました。"})
		return
	}

	err = repository.UpdateCategory(category)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "カテゴリ情報の更新に失敗しました。"})
		return
	}

	disSubcategoryInterface, ok := requestBody["disSubcategory"].([]interface{})
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disSubcategory の型が不正です"})
		return
	}

	for _, item := range disSubcategoryInterface {
		subcategory := &models.Subcategory{} // ポインタの初期化
		subcategory.UpdateUserNo = cuserNo_int

		if id, ok := item.(map[string]interface{})["SubcategoryID"].(float64); ok {
			subcategory.SubcategoryID = int(id)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "SubcategoryID の取得に失敗しました"})
			return
		}

		if name, ok := item.(map[string]interface{})["SubcategoryName"].(string); ok {
			subcategory.SubcategoryName = name
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "SubcategoryName の取得に失敗しました"})
			return
		}

		updateFlg, ok := item.(map[string]interface{})["UpdateFlg"].(bool)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "UpdateFlg の取得に失敗しました"})
			return
		}

		if updateFlg {
			errflg := repository.CheckSubcategoryConflicting(subcategory)

			if errflg == 1 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリ情報が重複しています。"})
				return
			} else if errflg == 2 {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリ情報の取得に失敗しました。"})
				return
			}

			if subcategory.SubcategoryID == -1 {
				subcategory.SubcategoryID = 0
				subcategory.CategoryID = int(categoryID)
				err = repository.CreateSubcategory(subcategory)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の作成に失敗しました。"})
					return
				}
			} else {
				err = repository.UpdateSubcategory(subcategory)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。"})
					return
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "カテゴリ情報が更新されました。"})
}

func DelCategory(c *gin.Context) {
	var requestBody map[string]interface{}

	// JSON データをパース
	if err := c.BindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "リクエストの解析に失敗しました"})
		return
	}

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

	disSubcategoryInterface, ok := requestBody["disSubcategory"].([]interface{})
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disSubcategory の型が不正です"})
		return
	}

	for _, item := range disSubcategoryInterface {
		subcategory := &models.Subcategory{} // ポインタの初期化
		subcategory.UpdateUserNo = cuserNo_int

		if id, ok := item.(map[string]interface{})["SubcategoryID"].(float64); ok {
			subcategory.SubcategoryID = int(id)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "SubcategoryID の取得に失敗しました"})
			return
		}

		err := repository.UpdateSubcategory(subcategory)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "カテゴリ情報が更新されました。"})
}

func DelSubcategory(c *gin.Context) {
	var requestBody map[string]interface{}

	// JSON データをパース
	if err := c.BindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "リクエストの解析に失敗しました"})
		return
	}

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

	subcategoryID, ok := requestBody["SubcategoryID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "SubcategoryID の型が不正です"})
		return
	}

	subcategory := &models.Subcategory{} // ポインタの初期化
	subcategory.SubcategoryID = int(subcategoryID)
	subcategory.DelFlg = true
	subcategory.UpdateUserNo = cuserNo_int

	errtn := repository.UpdateSubcategory(subcategory)
	if errtn != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "カテゴリ情報が更新されました。"})
}
