package middleware

import (
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Authorization ヘッダーからトークンを取得
		authHeader := c.Request.Header.Get("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		userName := c.Request.Header.Get("userName")
		if userName == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// トークンの検証
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// 秘密鍵を使ってトークンを検証する
			return []byte("your_secret_key"), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		c.Next()
	}
}
