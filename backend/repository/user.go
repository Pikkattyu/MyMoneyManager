package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"errors"
	"log"
)

// SaveUser saves a user to the database
func SaveUser(user *models.User) error {
	if err := utils.DB.Create(user).Error; err != nil {
		log.Printf("Error saving user %v: %v", user, err)
		return err
	}
	log.Printf("ユーザ作成時にエラーしました。", user)
	return nil
}

// ユーザ情報取得（ユーザID）
func GetUserByUserNo(UserNo string) (*models.User, error) {
	var user models.User
	if err := utils.DB.Where("user_no = ?", UserNo).First(&user).Error; err != nil {
		log.Printf("ユーザデータ取得時にエラーしました。 %s: %v", UserNo, err)
		return nil, err
	}
	return &user, nil
}

// ユーザ情報取得（ユーザIDの配列）
func GetUsersByUserNos(userNos []string) ([]models.User, error) {
	var users []models.User
	if err := utils.DB.Where("user_no IN (?)", userNos).Find(&users).Error; err != nil {
		log.Printf("ユーザデータ取得時にエラーしました。 %v", err)
		return nil, err
	}
	return users, nil
}

// ユーザ情報取得（ユーザID）
func GetUserByUserID(UserID string) (*models.User, error) {
	var user models.User
	if err := utils.DB.Where("user_id = ?", UserID).First(&user).Error; err != nil {
		log.Printf("ユーザデータ取得時にエラーしました。 %s: %v", UserID, err)
		return nil, err
	}
	return &user, nil
}

// ユーザ情報取得（Email）
func GetUserByEmail(Email string) (*models.User, error) {
	var user models.User
	if err := utils.DB.Where("email = ?", Email).First(&user).Error; err != nil {
		log.Printf("ユーザデータ取得時にエラーしました。 %s: %v", Email, err)
		return nil, err
	}
	return &user, nil
}

// UpdateUserByUsername updates a user's information based on their username
func UpdateUser(user *models.User) error {

	updatedData := make(map[string]interface{})
	if user.UserNo == 0 {
		return errors.New("ユーザNoがありません。")
	}
	updatedData["user_no"] = user.UserNo

	// フィールドが空でない場合に、更新データに追加する
	if user.UserID != "" {
		updatedData["user_id"] = user.UserID
	}
	if user.UserName != "" {
		updatedData["user_name"] = user.UserName
	}
	if user.Email != "" {
		updatedData["email"] = user.Email
	}
	if user.Password != "" {
		updatedData["password"] = user.Password
	}
	if user.BookID != 0 {
		updatedData["book_id"] = user.BookID
	}
	if user.Flg != 0 {
		updatedData["flg"] = user.Flg
	}
	if user.LastLogin.String() != "" {
		updatedData["last_login"] = user.LastLogin
	}
	if user.Register.String() != "" {
		updatedData["register"] = user.Register
	}

	// マップにデータがある場合のみ更新処理を行う
	if len(updatedData) > 0 {
		if err := utils.DB.Model(&user).Updates(updatedData).Error; err != nil {
			log.Printf("Error updating user with username %s: %v", user.UserName, err)
			return err
		}
	} else {
		log.Printf("更新データがありません。")
		return errors.New("更新データがありません。")
	}
	return nil

}
