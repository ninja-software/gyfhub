package gyfhub

import (
	"fmt"
	"regexp"
	"unicode"

	gocheckpasswd "github.com/ninja-software/go-check-passwd"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/null/v8"
)

var emailRegexp = regexp.MustCompile("^.+?@.+?\\..+?$")
var mobileRegexpAU = regexp.MustCompile("^04\\d{8}$")

// IsEmptyString checks if string given is ""
func IsEmptyString(text string) bool {
	return text == ""
}

// IsEmptyStringPtr check if string pointer is empty
func IsEmptyStringPtr(text *string) bool {
	return text == nil || *text == ""
}

// IsSameNullString check if two null string are the same
func IsSameNullString(a, b null.String) bool {
	// if a and b are both empty
	if a.IsZero() && b.IsZero() {
		return true
	}

	// if a and b are both valid, and they have same value, return true
	if a.Valid && b.Valid && a.String == b.String {
		return true
	}

	return false
}

// IsValidEmail checks if email given is valid
func IsValidEmail(email string) bool {
	return emailRegexp.MatchString(email)
}

// IsValidAustralianMobile check if the given mobile number is a valid Australia mobile number
func IsValidAUMobile(mobileNumber string) bool {
	return mobileRegexpAU.MatchString(mobileNumber)
}

// IsValidPassword checks whether the password entered is valid
func IsValidPassword(password string) (bool, error) {
	if len(password) < 8 {
		return false, terror.New(fmt.Errorf("Password must contain at least 8 characters"), "validate password")
	}

	// Check if it contains at least 1 letter and number
	hasNumber := false
	hasLetter := false

	for _, character := range password {
		if unicode.IsLetter(character) {
			hasLetter = true
		} else if unicode.IsNumber(character) {
			hasNumber = true
		}

		if hasLetter && hasNumber {
			break
		}
	}

	if !hasLetter || !hasNumber {
		return false, terror.New(fmt.Errorf("Password given must have at least one letter and number"), "validate password")
	}

	// Check common password
	if gocheckpasswd.IsCommon(password) {
		return false, terror.New(fmt.Errorf("Password given is too weak"), "validate password")
	}

	return true, nil
}
