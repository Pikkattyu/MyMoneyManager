package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// GetFilePaths は指定されたフォルダ内のファイルパス一覧を取得するエンドポイント
func GetFilePaths(c *gin.Context) {
	// フォルダパスをクエリパラメータから取得（例: /getFilePaths?dir=./uploads）
	dirPath := c.Query("dir")
	if dirPath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "フォルダパスが指定されていません。"})
		return
	}
	dirPath = "public/" + dirPath
	// 指定フォルダのファイル一覧を取得
	files, err := getFileList(dirPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "フォルダの読み取り中にエラーが発生しました。"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"files": files})
}

// getFileList は指定されたフォルダ内のファイルパスを取得する
func getFileList(dir string) ([]string, error) {
	var filePaths []string

	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		log.Printf("エラーが発生しました: %v", err)
		if err != nil {
			return err
		}
		// ディレクトリではなくファイルのみを取得
		if !info.IsDir() {
			filePaths = append(filePaths, path)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return filePaths, nil
}

func UploadImage(c *gin.Context) {
	// クエリパラメータまたはデフォルトのアップロードフォルダを取得
	defaultDir := "public/Icons"
	uploadDir := c.PostForm("path") // クライアントから渡された `path`
	if uploadDir == "" {
		uploadDir = defaultDir // `path` が指定されていなければデフォルトのパスを使用
	}

	// フォルダを作成（存在しない場合）
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "フォルダ作成エラー"})
		return
	}

	// ファイル取得
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "ファイルが見つかりません"})
		return
	}

	// ファイル名の取得（拡張子と分離）
	ext := filepath.Ext(file.Filename)
	name := file.Filename[:len(file.Filename)-len(ext)]

	// 保存パスの決定（重複チェック）
	filePath := filepath.Join(uploadDir, file.Filename)
	version := 1

	for {
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			// ファイルが存在しない場合、そのまま使用
			break
		}
		// ファイルが存在する場合、_Ver[n] を追加
		filePath = filepath.Join(uploadDir, fmt.Sprintf("%s_Ver%d%s", name, version, ext))
		version++
	}

	// ファイル保存
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "ファイル保存エラー"})
		return
	}

	// クライアントに返す
	c.JSON(http.StatusOK, gin.H{
		"filePath": fmt.Sprintf("/%s/%s", strings.TrimPrefix(uploadDir, "public"), filepath.Base(filePath)),
	})
}
