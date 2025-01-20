package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"log"
)

// CreateBook saves a book to the database
func CreateBook(book *models.Book) (*models.Book, error) {
	if err := utils.DB.Create(book).Error; err != nil {
		log.Printf("Error saving book %v: %v", book, err)
		return nil, err
	}
	log.Printf("Book %v saved successfully", book)
	return book, nil
}

// GetBookByBookname retrieves a book by their bookname from the database
func GetBookByBookname(BookID string) (*models.Book, error) {
	var book models.Book
	if err := utils.DB.Where("book_id = ?", BookID).First(&book).Error; err != nil {
		log.Printf("Error retrieving book with bookname %s: %v", BookID, err)
		return nil, err
	}
	log.Printf("Book %v retrieved successfully", book)
	return &book, nil
}

// ユーザNoで指定したデータを複数取得
func GetBooksByUserNo(userNo int) ([]models.Book, error) {
	var books []models.Book

	if err := utils.DB.Where("user_no = ?", userNo).Find(&books).Error; err != nil {
		log.Printf("ユーザ情報の取得に成功しました。", userNo, err)
		return nil, err
	}
	return books, nil
}

// ユーザNoで指定したデータを複数取得
func GetStartBookDay(bookID int) (int, error) {
	var startDay int

	if err := utils.DB.Table("books").
		Select("start_day").
		Where("book_id = ?", bookID).
		Scan(&startDay).Error; err != nil {
		log.Printf("書籍情報の取得に失敗しました。 BookID: %d, Error: %v", bookID, err)
		return 0, err
	}

	return startDay, nil
}
