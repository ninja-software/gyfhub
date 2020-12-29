package seed

import (
	"gyfhub/server/api"
	"gyfhub/server/crypto"
	"gyfhub/server/db"

	"github.com/volatiletech/null/v8"
	"syreclabs.com/go/faker"
)

// UserFactory creates a basic user
func UserFactory() *db.User {
	u := &db.User{
		FirstName:                faker.Name().FirstName(),
		LastName:                 faker.Name().LastName(),
		Email:                    faker.Internet().Email(),
		City:                     null.StringFrom("Perth"),
		Type:                     string(api.Creative),
		PasswordHash:             crypto.HashPassword("NinjaDojo_!"),
		AustralianBusinessNumber: null.StringFrom(faker.Number().Number(11)),
	}
	return u
}

func HubFactory() *db.Hub {
	h := &db.Hub{
		Name: faker.Company().Name(),
	}
	return h
}
