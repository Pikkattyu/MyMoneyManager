package handlers

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func BookRegister(c *gin.Context) {
	var book models.Book
	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("UserNo")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。"})
		return
	}

	// JSONを構造体にバインド
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	//データをセット
	var user models.User
	convint, err := strconv.Atoi(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	// UserIDを取得
	book.UserNo = convint
	book.AttendUserNos = fmt.Sprintf("%-10s", userNoCookie) // 10文字の固定長にする

	// 帳簿を新規作成
	book2, err := repository.CreateBook(&book)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿作成時にエラーが発生しました。"})
		return
	}

	names := []string{"現金", "PayPay", "銀行口座", "Suica"}
	tags := []string{"現金", "電子マネー", "口座", "電子マネー"}
	amounts := []int{10000, 70000, 30000, 3000}
	for i := 0; i < 4; i++ {
		asset := models.Assets{
			BookID:     book2.BookID,
			UserNo:     convint,
			AssetsName: names[i],
			Tag:        tags[i],
			Amount:     amounts[i],
		}
		// 帳簿を新規作成
		err := repository.CreateAssets(&asset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産データ作成時にエラーが発生しました。"})
			return
		}
	}

	user.UserNo = convint
	user.BookID = book2.BookID
	// ユーザ情報に帳簿データを記載
	if err := repository.UpdateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿切替にエラーが発生しました。"})
		return
	}

	expiration := time.Now().Add(30 * 24 * time.Hour)
	BookID := strconv.Itoa(user.BookID)
	cookie := http.Cookie{Name: "bookID", Value: BookID, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。"})
}

func GetBooks(c *gin.Context) {
	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("UserNo")
	if err != nil {
		log.Printf("ユーザIDの取得に失敗しました。: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ユーザIDの取得に失敗しました。"})
		return
	}

	convint, err := strconv.Atoi(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "文字から数字へ変換中にエラーが発生しました。"})
		return
	}

	// UserNoに基づいて帳簿を取得
	books, err := repository.GetBooksByUserNo(convint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿の取得時にエラーが発生しました。"})
		return
	}

	user, err := repository.GetUserByUserNo(userNoCookie)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ユーザ情報取得時にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": books, "user": user.BookID})
}
