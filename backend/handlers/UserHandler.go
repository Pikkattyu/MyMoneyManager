package handlers

import (
	middleware "MyMoneyManager/backend/middlewares"
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/repository"
	"MyMoneyManager/backend/utils"
	"log"
	"net/http"
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
	log.Printf("内容出力")
	log.Printf(user.UserID + " UserID")
	log.Printf(user.UserName + " UserName")
	log.Printf(user.Email + " Email")
	log.Printf(user.Password + " Password")

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
	token, err := utils.GenerateJWT(user.UserName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	//SetupSession()
	// クッキーにJWTトークンを設定
	expiration := time.Now().Add(30 * 24 * time.Hour)
	cookie := http.Cookie{Name: "token", Value: token, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully", "token": token, "expires": expiration})
}

// Login handles user login
func Login(c *gin.Context) {
	var loginDetails models.User
	if err := c.ShouldBindJSON(&loginDetails); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := repository.GetUserByUsername(loginDetails.UserName)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginDetails.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// JWTトークンを生成
	token, err := utils.GenerateJWT(user.UserName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// クッキーにJWTトークンを設定
	expiration := time.Now().Add(30 * 24 * time.Hour)
	cookie := http.Cookie{Name: "token", Value: token, Expires: expiration, Path: "/", HttpOnly: true}
	http.SetCookie(c.Writer, &cookie)

	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "token": token, "expires": expiration})
}

func Logout(c *gin.Context) {
	// ログアウト処理の実装
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

func AuthCheck(c *gin.Context) {
	//store := cookie.NewStore([]byte("secret"))
	middleware.AuthMiddleware()

	// ログイン済みの場合、ダッシュボードデータを返す
	c.JSON(http.StatusOK, gin.H{"data": "dashboard_data"})
}
