package routes

import (
	"MyMoneyManager/backend/handlers"

	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.Engine) {
	/*ユーザ関連*/
	router.POST("/api/register", handlers.Register)
	router.POST("/api/login", handlers.Login)
	router.GET("/api/logout", handlers.Logout)
	router.POST("/api/userinfomationchange", handlers.UserInfomationChange)
	router.GET("/api/authcheck", handlers.AuthCheck)
	router.GET("/api/getuserassets", handlers.GetUserAssetsData)

	/*帳簿関連*/
	router.POST("/api/bookregister", handlers.BookRegister)
	router.GET("/api/getbook", handlers.GetBooks)

	/*帳簿資産関連*/
	router.GET("/api/getassetsall", handlers.GetAssetsAll)
	router.POST("/api/assetsregister", handlers.AssetsRegister)

}
