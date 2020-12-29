package helpers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"

	"github.com/gofrs/uuid"

	"github.com/ninja-software/terror"
)

// parseQueryText parse the search text for full text search
func ParseQueryText(queryText string) string {
	// sanity check
	if queryText == "" {
		return ""
	}

	// trim leading and trailing spaces
	re2 := regexp.MustCompile("\\s+")
	keywords := strings.TrimSpace(queryText)
	// to lowercase
	keywords = strings.ToLower(keywords)
	// remove excess spaces
	keywords = re2.ReplaceAllString(keywords, " ")
	// no non-alphanumeric
	re := regexp.MustCompile("[^a-z0-9\\-\\. ]")
	keywords = re.ReplaceAllString(keywords, "")

	// keywords array
	xkeywords := strings.Split(keywords, " ")
	// for sql construction
	var keywords2 []string
	// build sql keywords
	for _, keyword := range xkeywords {
		// skip blank, to prevent error on construct sql search
		if len(keyword) == 0 {
			continue
		}

		// add prefix for partial word search
		keyword = keyword + ":*"
		// add to search string queue
		keywords2 = append(keywords2, keyword)
	}
	// construct sql search
	xsearch := strings.Join(keywords2, " & ")

	return xsearch

}

// EncodeJSON will encode json to response writer and return status ok.
func EncodeJSON(w http.ResponseWriter, result interface{}) (int, error) {
	err := json.NewEncoder(w).Encode(result)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "")
	}
	return http.StatusOK, nil
}

// UUIDSliceToString accepts a slice of uuid's and will output a slice of strings to use in boiler etc.
func UUIDSliceToString(ids []uuid.UUID) []string {
	out := []string{}
	for _, id := range ids {
		out = append(out, id.String())
	}
	return out
}

// NullUUIDFromString accepts an id, determines if its a valid uuid, and outputs a NullUUID as appropriate
func NullUUIDFromString(id string) uuid.NullUUID {
	out := uuid.NullUUID{
		UUID:  uuid.UUID{},
		Valid: false,
	}

	u, err := uuid.FromString(id)
	if err != nil {
		return out
	}

	out.UUID = u
	out.Valid = true

	return out
}

// FilterDistinctElement from two string array
func FilterDistinctElement(a, b []string) []string {
	result := []string{}
	list := append(a, b...)
	for _, s := range list {
		if !ExistInStringArray(result, s) {
			result = append(result, s)
		}
	}
	return result
}

// ExistInStringArray return true if element exists in the string array, otherwise return false
func ExistInStringArray(list []string, s string) bool {
	for _, e := range list {
		if e == s {
			return true
		}
	}
	return false
}

// IsEmptyStringPtr check if string pointer is empty
func IsEmptyStringPtr(text *string) bool {
	return text == nil || *text == ""
}

var mobileRegexpAU = regexp.MustCompile("^04\\d{8}$")

// IsValidAustralianMobile check if the given mobile number is a valid Australia mobile number
func IsValidAUMobile(mobileNumber string) bool {
	return mobileRegexpAU.MatchString(mobileNumber)
}

var emailRegexp = regexp.MustCompile("^.+?@.+?\\..+?$")

// IsValidEmail checks if email given is valid
func IsValidEmail(email string) bool {
	return emailRegexp.MatchString(email)
}
