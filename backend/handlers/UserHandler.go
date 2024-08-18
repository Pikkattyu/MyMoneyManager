package handlers

import (
	middleware "MyMoneyManager/backend/middlewares"
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"MyMoneyManager/backend/utils"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Register handles user registration
func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user.Password = hashedPassword
	if err := repository.SaveUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user"})
		return
	}

	// JWTトークンを生成
	token, err := utils.GenerateJWT(strconv.Itoa(user.UserNo))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// クッキーにJWTトークンを設定
	expiration := time.Now().Add(30 * 24 * time.Hour)
	cookie := http.Cookie{Name: "token", Value: token, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	UserNo := strconv.Itoa(user.UserNo)
	cookie = http.Cookie{Name: "userNo", Value: UserNo, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	UserName := user.UserName
	cookie = http.Cookie{Name: "userName", Value: UserName, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	BookID := strconv.Itoa(user.BookID)
	cookie = http.Cookie{Name: "bookID", Value: BookID, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	c.JSON(http.StatusOK, gin.H{"message": "ログインに成功しました", "token": token, "expires": expiration, "userNo": UserNo, "userName": UserName, "bookID": BookID})
}

// Login handles user login
func Login(c *gin.Context) {
	var loginDetails models.User
	if err := c.ShouldBindJSON(&loginDetails); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := repository.GetUserByUserID(loginDetails.UserID)
	if err != nil {
		user, err = repository.GetUserByEmail(loginDetails.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "ユーザの取得に失敗しました。"})
			return
		}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginDetails.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "パスワードの暗号化に失敗しました。"})
		return
	}

	// JWTトークンを生成
	token, err := utils.GenerateJWT(strconv.Itoa(user.UserNo))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "トークンの作成に失敗しました。"})
		return
	}

	// クッキーにJWTトークンを設定
	expiration := time.Now().Add(30 * 24 * time.Hour)
	cookie := http.Cookie{Name: "token", Value: token, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	UserNo := strconv.Itoa(user.UserNo)
	cookie = http.Cookie{Name: "userNo", Value: UserNo, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	UserName := user.UserName
	cookie = http.Cookie{Name: "userName", Value: UserName, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	BookID := strconv.Itoa(user.BookID)
	cookie = http.Cookie{Name: "bookID", Value: BookID, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	c.JSON(http.StatusOK, gin.H{"message": "ログインに成功しました", "token": token, "expires": expiration, "userNo": UserNo, "userName": UserName, "bookID": BookID})
}

func Logout(c *gin.Context) {
	// ログアウト処理の実装
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.SetCookie("userNo", "", -1, "/", "", false, true)
	c.SetCookie("userName", "", -1, "/", "", false, true)
	c.SetCookie("bookID", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "ログアウトしました。"})
}

func AuthCheck(c *gin.Context) {
	//store := cookie.NewStore([]byte("secret"))
	authHeader := c.Request.Header.Get("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインされていません。"})
		c.Abort()
		return
	}
	middleware.AuthMiddleware()

	// ログイン済みの場合、ダッシュボードデータを返す
	c.JSON(http.StatusOK, gin.H{"data": "dashboard_data"})
}

func UserInfomationChange(c *gin.Context) {
	var user models.User

	// JSONを構造体にバインド
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

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
	user.UserNo = convint

	// ユーザ情報に帳簿データを記載
	if err := repository.UpdateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "帳簿切替にエラーが発生しました。"})
		return
	}

	expiration := time.Now().Add(30 * 24 * time.Hour)
	BookID := strconv.Itoa(user.BookID)
	cookie := http.Cookie{Name: "bookID", Value: BookID, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	c.JSON(http.StatusOK, gin.H{"message": "正常に処理が終了しました。"})
}

func GetUserAssetsData(c *gin.Context) {
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

	c.JSON(http.StatusOK, gin.H{"data": users})
}
