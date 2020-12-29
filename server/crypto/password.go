package crypto

import (
	"encoding/base64"

	"github.com/ninja-software/terror"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword encrypts a plaintext string and returns the hashed version in base64
func HashPassword(password string) string {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	return base64.StdEncoding.EncodeToString(hashed)
}

func ComparePassword(hashed, password string) error {
	storedHash, err := base64.StdEncoding.DecodeString(hashed)
	if err != nil {
		return terror.New(err, "fail to encode password")
	}

	err = bcrypt.CompareHashAndPassword(storedHash, []byte(password))
	if err != nil {
		return terror.New(err, "fail to compare password")
	}
	return nil
}
