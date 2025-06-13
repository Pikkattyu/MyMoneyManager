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
	router.POST("/api/deleteassets", handlers.DelAssets)

	/*カテゴリ関連*/
	router.GET("/api/getcategoryall", handlers.GetCategoryAll)
	router.GET("/api/getcategory", handlers.GetCategory)
	router.POST("/api/changecategory", handlers.ChangeCategory)
	router.POST("/api/createcategory", handlers.CreateCategory)
	router.POST("/api/deletecategory", handlers.DelCategory)
	router.POST("/api/deletesubcategory", handlers.DelSubcategory)

	/*入出金関連*/
	router.GET("/api/gettransactiondata", handlers.GetTransactionsAll)
	router.GET("/api/gettransactionrelation", handlers.GetTransactionsRelation)
	router.GET("/api/gettransaction", handlers.GetTransaction)
	router.POST("/api/createtransaction", handlers.TransactionRegister)
	router.POST("/api/changetransaction", handlers.ChangeTransaction)
	router.POST("/api/deletetransaction", handlers.DelTransaction)

	/*統計関連*/
	//router.GET("/api/getstatistics", handlers.GetStatisticsAll)
	router.GET("/api/getstatisticsdata", handlers.GetStatisticsAll)

	/*ファイル関連*/
	router.GET("/api/getfilepath", handlers.GetFilePaths)
	router.POST("/api/uploadfilepath", handlers.UploadImage)

	/*メモ関連*/
	router.POST("/api/creatememo", handlers.MemoRegister)
	router.POST("/api/changememo", handlers.ChangeMemo)
	router.POST("/api/deletememo", handlers.DelMemo)
	router.GET("/api/getmemo", handlers.GetMemo)

	/*ユーザ設定関連*/
	router.GET("/api/getusersetting", handlers.GetUserSetting)
	router.POST("/api/changeusersetting", handlers.ChangeUserSetting)

	/*案件関連*/
	router.GET("/api/getworkall", handlers.GetWorkAll)
	router.GET("/api/getwork", handlers.GetWork)
	router.POST("/api/creatework", handlers.WorkRegister)
	router.POST("/api/changework", handlers.ChangeWork)

	/*カテゴリ関連*/
	router.GET("/api/getschedulecategoryall", handlers.GetScheduleCategoryAll)
	router.GET("/api/getschedulecategory", handlers.GetScheduleCategory)
	router.POST("/api/changeschedulecategory", handlers.ChangeScheduleCategory)
	router.POST("/api/createschedulecategory", handlers.CreateScheduleCategory)
	router.POST("/api/deleteschedulecategory", handlers.DelScheduleCategory)
	router.POST("/api/deleteschedulesubcategory", handlers.DelScheduleSubcategory)

	/*カレンダー関連*/
	router.GET("/api/getcalendarall", handlers.GetCalendarsAll)
	router.POST("/api/changecalendar", handlers.ChangeCalendar)
	router.POST("/api/createcalendar", handlers.CalendarRegister)
	router.GET("/api/getcalendar", handlers.GetCalendar)

	/*通知関連*/
	router.GET("/api/getNotice", handlers.GetNotice)
	router.POST("/api/changeNotice", handlers.ChangeNotice)
	router.POST("/api/createNotice", handlers.NoticeRegister)
	router.GET("/api/getNoticeAll", handlers.GetNoticeAll)
	router.GET("/api/getNoticeDate", handlers.GetNoticeDate)

	/*テンプレ関連*/
	router.GET("/api/getTemplateAll", handlers.GetTemplateAll)
	router.POST("/api/changeTemplate", handlers.ChangeTemplate)
	router.POST("/api/delTemplate", handlers.DelTemplate)
	router.POST("/api/createTemplate", handlers.CreateTemplate)
	router.GET("/api/getTemplate", handlers.GetTemplate)
	router.POST("/api/setTemplate", handlers.SetTemplate)
}
