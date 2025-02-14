package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetUserSetting(c *gin.Context) {
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

	UserNo, err := c.Cookie("userNo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	convintuser, err := strconv.Atoi(UserNo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	categories, err := repository.GetCategoryAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリ情報取得時にエラーが発生しました。"})
		return
	}

	assetses, err := repository.GetAssetsAll(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	usersetting, err := repository.GetUserSetting(convintuser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"category": categories, "assets": assetses, "usersetting": usersetting[0]})
}

func ChangeUserSetting(c *gin.Context) {

	UserNo, err := c.Cookie("userNo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	convint, err := strconv.Atoi(UserNo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	var req models.UserSetting
	// リクエストボディを構造体にバインド
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}
	req.UserNo = convint
	// 構造体の内容を表示
	ret := repository.UpdateUserSetting(req)
	if ret != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	expiration := time.Now().Add(30 * 24 * time.Hour)
	cookie := http.Cookie{Name: "AutoFeeAllocationAssetsID", Value: strconv.Itoa(req.AutoFeeAllocationAssetsID), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	cookie = http.Cookie{Name: "AutoFeeAllocationCategoryID", Value: strconv.Itoa(req.AutoFeeAllocationCategoryID), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	cookie = http.Cookie{Name: "AutoFeeAllocationSubcategoryID", Value: strconv.Itoa(req.AutoFeeAllocationSubcategoryID), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	cookie = http.Cookie{Name: "DefaultTransactionDisplay", Value: strconv.Itoa(req.DefaultTransactionType), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	cookie = http.Cookie{Name: "DefaultTransactionType", Value: strconv.Itoa(req.DefaultTransactionType), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	cookie = http.Cookie{Name: "MonthStartDate", Value: strconv.Itoa(req.MonthStartDate), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	cookie = http.Cookie{Name: "WeekStartDay", Value: strconv.Itoa(req.WeekStartDay), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	cookie = http.Cookie{Name: "ExcludeAfterDate", Value: strconv.FormatBool(req.ExcludeAfterDate), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	cookie = http.Cookie{Name: "ShowZeroAmountItems", Value: strconv.FormatBool(req.ShowZeroAmountItems), Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	c.JSON(http.StatusOK, gin.H{"結果": "正常終了"})
}
