package routes

import (
    "github.com/gin-gonic/gin"
    "my-gin-app/handlers"
)

func SetupRoutes(r *gin.Engine) {
    // GET /user のハンドラーを指定
    r.GET("/user", handlers.GetUser)
}
