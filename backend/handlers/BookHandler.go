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

// カテゴリ情報を表す構造体
type InitCategory struct {
	Name       string   `json:"name"`
	Flg        int      `json:"flg"`
	SubCatames []string `json:"subcatenames"`
}

// 資産情報を表す構造体
type InitAsset struct {
	Name   string `json:"name"`   // 資産の名前
	Tag    string `json:"tag"`    // 資産のタグ
	Amount int    `json:"amount"` // 資産の金額
}

func BookRegister(c *gin.Context) {
	var book models.Book
	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("userNo")
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

	assets := []InitAsset{
		{Name: "現金", Tag: "現金", Amount: 10000},
		{Name: "PayPay", Tag: "電子マネー", Amount: 70000},
		{Name: "銀行口座", Tag: "口座", Amount: 30000},
		{Name: "Suica", Tag: "電子マネー", Amount: 3000},
	}

	for i := 0; i < len(assets); i++ {
		asset := models.Assets{
			BookID:     book2.BookID,
			UserNo:     convint,
			AssetsName: assets[i].Name,
			Tag:        assets[i].Tag,
			Amount:     assets[i].Amount,
		}
		// 帳簿を新規作成
		err := repository.CreateAssets(&asset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "資産データ作成時にエラーが発生しました。"})
			return
		}
	}

	// データを一つのオブジェクト型にまとめる
	categories := []InitCategory{
		//支出の内容（デフォルト）
		{Name: "食費", Flg: 1, SubCatames: []string{"朝食", "昼食", "夕食", "夜食", "お菓子"}},
		{Name: "交通費", Flg: 1, SubCatames: []string{"仕事", "プライベート"}},
		{Name: "固定費", Flg: 1, SubCatames: []string{"家賃", "水道", "光熱費", "通信費"}},
		{Name: "日用品", Flg: 1, SubCatames: []string{"Amazon", "楽天市場", "買い物"}},
		{Name: "娯楽", Flg: 1, SubCatames: []string{"Amazon", "楽天市場", "買い物"}},
		{Name: "病院", Flg: 1, SubCatames: []string{""}},
		{Name: "美容品", Flg: 1, SubCatames: []string{""}},

		//収入の内容（デフォルト）
		{Name: "給料", Flg: 0, SubCatames: []string{"給与", "賞与"}},
		{Name: "副業", Flg: 0, SubCatames: []string{""}},
	}

	for i := 0; i < len(categories); i++ {
		Category := models.Category{
			BookID:       book2.BookID,
			CategoryName: categories[i].Name,
			Flg:          categories[i].Flg,
		}
		// 帳簿を新規作成
		reCategory, err := repository.CreateCategory(&Category)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "カテゴリデータ作成時にエラーが発生しました。"})
			return
		}
		for _, subcat := range categories[i].SubCatames {
			Subcategory := models.Subcategory{
				CategoryID:      reCategory.CategoryID,
				SubcategoryName: subcat,
			}
			if err := repository.CreateSubcategory(&Subcategory); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "サブカテゴリデータ作成時にエラーが発生しました。"})
				return
			}
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

	c.JSON(http.StatusOK, gin.H{"message": "帳簿を作成しました。", "bookID": BookID})
}

func GetBooks(c *gin.Context) {
	// CookieからUserIDを取得
	userNoCookie, err := c.Cookie("userNo")
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
