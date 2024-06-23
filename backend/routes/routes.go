package routes

import (
	"MyMoneyManager/backend/handlers"

	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.Engine) {
	router.POST("/api/register", handlers.Register)
	router.POST("/api/login", handlers.Login)
	router.GET("/api/logout", handlers.Logout)
	router.GET("/api/authcheck", handlers.AuthCheck)
}
