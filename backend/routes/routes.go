package routes

import (
	"MyMoneyManager/backend/handlers"

	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.Engine) {
	/*ユーザ関連*/
	router.POST("/api/register", handlers.UserRegister)
	router.POST("/api/login", handlers.Login)
	router.GET("/api/logout", handlers.Logout)
	router.POST("/api/userinfomationchange", handlers.UserInfomationChange)
	router.GET("/api/authcheck", handlers.AuthCheck)
	router.GET("/api/getuserassets", handlers.GetUserAssetsData)

	/*帳簿関連*/
	router.POST("/api/bookregister", handlers.BookRegister)
	router.GET("/api/getbook", handlers.GetBooks)

	/*帳簿資産関連*/
	router.GET("/api/getassets", handlers.GetAssets)
	router.GET("/api/getassetsall", handlers.GetAssetsAll)
	router.POST("/api/changeassets", handlers.ChangeAssets)
	router.POST("/api/assetsregister", handlers.AssetsRegister)

	/*カテゴリ関連*/
	router.GET("/api/getcategoryall", handlers.GetCategoryAll)
	router.GET("/api/getcategory", handlers.GetCategory)
	router.POST("/api/changecategory", handlers.ChangeCategory)
	router.POST("/api/createcategory", handlers.CreateCategory)

	/*入出金関連*/
	router.GET("/api/gettransactiondata", handlers.GetTransactionsAll)
	router.GET("/api/gettransactionrelation", handlers.GetTransactionsRelation)
	router.GET("/api/gettransaction", handlers.GetTransaction)
	router.POST("/api/createtransaction", handlers.TransactionRegister)
	router.POST("/api/changetransaction", handlers.ChangeTransaction)
	router.POST("/api/deletetransaction", handlers.DelTransaction)

	/*統計関連*/
	router.GET("/api/getstatistics", handlers.GetStatisticsAll)

	/*メモ関連*/
	router.POST("/api/creatememo", handlers.MemoRegister)
	router.POST("/api/changememo", handlers.ChangeMemo)
	router.POST("/api/deletememo", handlers.DelMemo)
	router.GET("/api/getmemo", handlers.GetMemo)
}
