package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateTemplate(c *gin.Context) {
	var requestBody map[string]interface{}
	template := &models.Template{} // ポインタの初期化

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

	templateName, ok := requestBody["TemplateName"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disTemplate の型が不正です"})
		return
	}

	backgroundcolor, ok := requestBody["Backgroundcolor"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Backgroundcolor の型が不正です"})
		return
	}

	remarks, ok := requestBody["Remarks"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Backgroundcolor の型が不正です"})
		return
	}

	template.TemplateName = templateName
	template.BookID = convint
	template.Remarks = remarks
	template.Backgroundcolor = backgroundcolor

	templateID, err := repository.CreateTemplate(template)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "カテゴリ情報の更新に失敗しました。"})
		return
	}

	disTemplateInfomationInterface, ok := requestBody["disTemplateInfomation"].([]interface{})
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disTemplateInfomation の型が不正です"})
		return
	}

	for _, item := range disTemplateInfomationInterface {
		templateInfo := &models.TemplateInfomation{} // ポインタの初期化

		if categoryID, ok := item.(map[string]interface{})["CategoryID"].(float64); ok {
			templateInfo.CategoryID = int(categoryID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "CategoryIDの取得に失敗しました"})
			return
		}

		if subcategoryID, ok := item.(map[string]interface{})["SubcategoryID"].(float64); ok {
			templateInfo.SubcategoryID = int(subcategoryID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "SubcategoryIDの取得に失敗しました"})
			return
		}

		if title, ok := item.(map[string]interface{})["Title"].(string); ok {
			templateInfo.Title = title
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "Titleの取得に失敗しました"})
			return
		}

		if startTime, ok := item.(map[string]interface{})["StartDateTime"].(string); ok {
			templateInfo.StartTime = startTime
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "StartDateTimeの取得に失敗しました"})
			return
		}

		if endTime, ok := item.(map[string]interface{})["EndDateTime"].(string); ok {
			templateInfo.EndTime = endTime
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "EndDateTimeの取得に失敗しました"})
			return
		}

		if incomeFlg, ok := item.(map[string]interface{})["IncomeFlg"].(float64); ok {
			templateInfo.IncomeFlg = int(incomeFlg)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "IncomeFlgの取得に失敗しました"})
			return
		}

		if viewFlg, ok := item.(map[string]interface{})["ViewFlg"].(bool); ok {
			templateInfo.ViewFlg = viewFlg
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "ViewFlgの取得に失敗しました"})
			return
		}

		if remarks, ok := item.(map[string]interface{})["Remarks"].(string); ok {
			templateInfo.Remarks = remarks
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "Remarksの取得に失敗しました"})
			return
		}

		if backgroundcolor, ok := item.(map[string]interface{})["Color"].(string); ok {
			templateInfo.Backgroundcolor = backgroundcolor
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "Colorの取得に失敗しました"})
			return
		}

		templateInfo.TemplateID = templateID
		templateInfo.UpdateUserNo = cuserNo_int
		err = repository.CreateTemplateInfomation(templateInfo)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の作成に失敗しました。"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "カテゴリ情報が更新されました。"})
}

func GetTemplateAll(c *gin.Context) {
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

	categories, err := repository.GetTemplateAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

func GetTemplate(c *gin.Context) {
	templateID := c.Query("TemplateID")

	convint, err := strconv.Atoi(templateID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	categoris, err := repository.GetTemplate(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": categoris})
}

func ChangeTemplate(c *gin.Context) {
	var requestBody map[string]interface{}
	template := models.Template{} // ポインタの初期化

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

	template_id, ok := requestBody["TemplateID"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disTemplate の型が不正です"})
		return
	}

	templateName, ok := requestBody["TemplateName"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disTemplate の型が不正です"})
		return
	}

	backgroundcolor, ok := requestBody["Backgroundcolor"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Backgroundcolor の型が不正です"})
		return
	}

	remarks, ok := requestBody["Remarks"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Backgroundcolor の型が不正です"})
		return
	}

	template.TemplateID = int(template_id)
	template.TemplateName = templateName
	template.BookID = convint
	template.Remarks = remarks
	template.Backgroundcolor = backgroundcolor

	err = repository.UpdateTemplate(template)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "テンプレートの更新に失敗しました。"})
		return
	}

	disTemplateInfomationInterface, ok := requestBody["disTemplateInfomation"].([]interface{})
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "disTemplateInfomation の型が不正です"})
		return
	}

	for _, item := range disTemplateInfomationInterface {
		templateInfo := &models.TemplateInfomation{} // ポインタの初期化
		templateInfo.TemplateID = template.TemplateID
		templateInfo.UpdateUserNo = cuserNo_int

		if templateInfomationID, ok := item.(map[string]interface{})["TemplateInfomationID"].(float64); ok {
			templateInfo.TemplateInfomationID = int(templateInfomationID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "TemplateInfomationIDの取得に失敗しました"})
			return
		}

		if categoryID, ok := item.(map[string]interface{})["CategoryID"].(float64); ok {
			templateInfo.CategoryID = int(categoryID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "CategoryIDの取得に失敗しました"})
			return
		}

		if subcategoryID, ok := item.(map[string]interface{})["SubcategoryID"].(float64); ok {
			templateInfo.SubcategoryID = int(subcategoryID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "SubcategoryIDの取得に失敗しました"})
			return
		}

		if title, ok := item.(map[string]interface{})["Title"].(string); ok {
			templateInfo.Title = title
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "Titleの取得に失敗しました"})
			return
		}

		if startTime, ok := item.(map[string]interface{})["StartDateTime"].(string); ok {
			templateInfo.StartTime = startTime
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "StartDateTimeの取得に失敗しました"})
			return
		}

		if endTime, ok := item.(map[string]interface{})["EndDateTime"].(string); ok {
			templateInfo.EndTime = endTime
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "EndDateTimeの取得に失敗しました"})
			return
		}

		if incomeFlg, ok := item.(map[string]interface{})["IncomeFlg"].(float64); ok {
			templateInfo.IncomeFlg = int(incomeFlg)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "IncomeFlgの取得に失敗しました"})
			return
		}

		if viewFlg, ok := item.(map[string]interface{})["ViewFlg"].(bool); ok {
			templateInfo.ViewFlg = viewFlg
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "ViewFlgの取得に失敗しました"})
			return
		}

		if workID, ok := item.(map[string]interface{})["WorkID"].(float64); ok {
			templateInfo.WorkID = int(workID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "ViewFlgの取得に失敗しました"})
			return
		}

		if remarks, ok := item.(map[string]interface{})["Remarks"].(string); ok {
			templateInfo.Remarks = remarks
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "Remarksの取得に失敗しました"})
			return
		}

		if backgroundcolor, ok := item.(map[string]interface{})["Color"].(string); ok {
			templateInfo.Backgroundcolor = backgroundcolor
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "Colorの取得に失敗しました"})
			return
		}

		updateFlg, ok := item.(map[string]interface{})["UpdateFlg"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"messageError": "UpdateFlg の取得に失敗しました"})
			return
		}

		if updateFlg > 0 {
			if updateFlg == 1 {
				err = repository.UpdateTemplateInfomation(templateInfo)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。"})
					return
				}
			} else if updateFlg == 2 {
				templateInfo.TemplateInfomationID = 0
				err = repository.CreateTemplateInfomation(templateInfo)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の作成に失敗しました。"})
					return
				}
			} else {
				templateInfo.DelFlg = true
				err = repository.UpdateTemplateInfomation(templateInfo)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の削除に失敗しました。"})
					return
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "カテゴリ情報が更新されました。"})
}

func DelTemplate(c *gin.Context) {
	template := models.Template{} // ポインタの初期化

	// JSON データをパース
	if err := c.BindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "リクエストの解析に失敗しました"})
		return
	}

	errtn := repository.UpdateTemplate(template)
	if errtn != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "サブカテゴリ情報の更新に失敗しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "カテゴリ情報が更新されました。"})
}
