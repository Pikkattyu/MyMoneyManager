package middlewares

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// AuthMiddlewareは認証トークンをチェックするミドルウェアです
func AuthMiddleware(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if token == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	c.Next()
}
