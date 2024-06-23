package repository

import (
	"MyMoneyManager/backend/models"
	"MyMoneyManager/backend/utils"
	"log"
)

// SaveUser saves a user to the database
func SaveUser(user *models.User) error {
	if err := utils.DB.Create(user).Error; err != nil {
		log.Printf("Error saving user %v: %v", user, err)
		return err
	}
	log.Printf("User %v saved successfully", user)
	return nil
}

// GetUserByUsername retrieves a user by their username from the database
func GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	if err := utils.DB.Where("user_name = ?", username).First(&user).Error; err != nil {
		log.Printf("Error retrieving user with username %s: %v", username, err)
		return nil, err
	}
	log.Printf("User %v retrieved successfully", user)
	return &user, nil
}
