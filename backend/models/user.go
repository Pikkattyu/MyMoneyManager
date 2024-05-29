package models

import (
    "gorm.io/gorm"
)

// User モデル
type User struct {
    gorm.Model
    Name     string
    Email    string 
    Age      int
    Location string
}