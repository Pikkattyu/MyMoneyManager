package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CategoryRegister(c *gin.Context) {
	var jsonData map[string]interface{}
	category := &models.Category{} // ポインタの初期化

	// JSONをマップにバインド
	if err := c.ShouldBindJSON(&jsonData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	// additionalData を取り出し、削除する
	var subcategorys []string
	if data, ok := jsonData["subcategorys"].([]interface{}); ok {
		for _, item := range data {
			if str, ok := item.(string); ok {
				subcategorys = append(subcategorys, str)
			}
		}
		delete(jsonData, "subcategorys")
	}

	// 残りのデータを JSON 形式に変換
	filteredJSON, err := json.Marshal(jsonData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "データの変換に失敗しました。"})
		return
	}

	// JSON 形式のデータを models.Assets にバインド
	if err := json.Unmarshal(filteredJSON, &category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "構造体へのバインドに失敗しました。"})
		return
	}

	// CookieからUserIDを取得（数字返還）
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
	category.BookID = convint

	errflg := repository.CheckCategoryConflicting(category)
	if errflg == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報が重複しています。"})
		return
	} else if errflg == 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産情報の取得に失敗しました。"})
		return
	}

	reCategory, err := repository.CreateCategory(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリの作成に失敗ました。"})
		return
	}

	for _, subcat := range subcategorys {
		Subcategory := &models.Subcategory{
			CategoryID:      reCategory.CategoryID,
			SubcategoryName: subcat,
		}
		if err := repository.CreateSubcategory(Subcategory); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリデータ作成時にエラーが発生しました。"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。"})
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

	assetses, err := repository.GetCategoryAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": assetses})
}

func GetCategory(c *gin.Context) {
	categoryID := c.Query("CategoryID")

	convint, err := strconv.Atoi(categoryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	assetses, err := repository.GetCategory(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": assetses})
}

func ChangeCategory(c *gin.Context) {
	var requestBody map[string]interface{}
	category := &models.Category{} // ポインタの初期化

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

	category.CategoryName = disCategory
	category.Flg = int(isAssetsView)
	category.BookID = convint
	category.CategoryID = int(categoryID)

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
		no, ok := item.(map[string]interface{})["SubcategoryNo"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "SubcategoryNo の取得に失敗しました"})
			return
		}

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

			if no == 0 {
				subcategory.CategoryID = int(categoryID)
				err = repository.CreateSubcategory(subcategory)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。"})
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
