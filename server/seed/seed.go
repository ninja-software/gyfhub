package seed

import (
	"encoding/json"
	"fmt"
	"gyfhub/server/db"
	"io/ioutil"
	"net/http"

	"github.com/h2non/filetype"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"syreclabs.com/go/faker"
)

func Run(conn *sqlx.DB) error {
	var err error
	fmt.Println("Seeding cities")
	err = Cities(conn)
	if err != nil {
		return terror.New(err, "seeding cities failed")
	}
	fmt.Println("Seeding users")
	err = Users(conn)
	if err != nil {
		return terror.New(err, "seeding users failed")
	}

	fmt.Println("Seeding hubs")
	err = Hubs(conn)
	if err != nil {
		return terror.New(err, "seeding hubs failed")
	}

	fmt.Println("Seed complete")
	return nil
}

var CityNameList = []string{
	"Sydney",
	"Melbourne",
	"Brisbane",
	"Perth",
	"Adelaide",
	"Gold Coast–Tweed Heads",
	"Newcastle–Maitland",
	"Canberra–Queanbeyan",
	"Sunshine Coast",
	"Wollongong",
	"Geelong",
	"Hobart",
	"Townsville",
	"Cairns",
	"Darwin",
	"Toowoomba",
	"Ballarat",
	"Bendigo",
	"Albury–Wodonga",
	"Launceston",
	"Mackay",
	"Rockhampton",
	"Bunbury",
	"Coffs Harbour",
	"Bundaberg",
	"Wagga Wagga",
	"Hervey Bay",
	"Mildura–Wentworth",
	"Shepparton–Mooroopna",
	"Port Macquarie",
	"Gladstone–Tannum Sands",
	"Tamworth",
	"Traralgon–Morwell",
	"Orange",
	"Bowral–Mittagong",
	"Busselton",
	"Geraldton",
	"Dubbo",
	"Nowra–Bomaderry",
	"Warragul–Drouin",
	"Bathurst",
	"Warrnambool",
	"Albany",
	"Kalgoorlie–Boulder",
	"Devonport",
	"Mount Gambier",
	"Lismore",
	"Nelson Bay",
	"Maryborough",
	"Burnie–Wynyard",
	"Alice Springs",
	"Victor Harbor–Goolwa",
	"Taree",
	"Ballina",
	"Morisset–Cooranbong",
	"Armidale",
	"Goulburn",
	"Whyalla",
	"Gympie",
	"Forster–Tuncurry",
	"Echuca–Moama",
	"Griffith",
	"Grafton",
	"Wangaratta",
	"St Georges Basin–Sanctuary Point",
	"Yeppoon",
	"Mount Isa",
	"Murray Bridge",
	"Broken Hill",
	"Camden Haven",
	"Moe–Newborough",
	"Karratha",
	"Singleton",
	"Batemans Bay",
	"Horsham",
	"Port Lincoln",
	"Ulladulla",
	"Warwick",
	"Kempsey",
	"Bairnsdale",
	"Sale",
	"Broome",
	"Ulverstone",
	"Port Hedland",
	"Port Pirie",
	"Emerald",
	"Port Augusta",
	"Lithgow",
	"Colac",
	"Muswellbrook",
	"Esperance",
	"Mudgee",
	"Parkes",
	"Swan Hill",
	"Portland",
	"Kingaroy",
}

func Cities(conn *sqlx.DB) error {
	for _, name := range CityNameList {
		c := &db.City{
			Name: name,
		}
		err := c.Insert(conn, boil.Infer())
		if err != nil {
			return terror.New(err, "insert city")
		}
	}
	return nil
}

func Users(conn *sqlx.DB) error {
	// insert admin user
	u1 := UserFactory()
	u1.Email = "admin@example.com"
	err := u1.Insert(conn, boil.Infer())
	if err != nil {
		return terror.New(err, "failed to insert admin user")
	}

	err = AddAvatar(conn, u1)
	if err != nil {
		return terror.New(err, "failed to insert avatar")
	}

	// insert member user
	u2 := UserFactory()
	u2.Email = "member@example.com"
	err = u2.Insert(conn, boil.Infer())
	if err != nil {
		return terror.New(err, "failed to insert member user")
	}

	err = AddAvatar(conn, u2)
	if err != nil {
		return terror.New(err, "failed to insert avatar")
	}

	// insert random users
	for i := 0; i < 15; i++ {
		u := UserFactory()
		err := u.Insert(conn, boil.Infer())
		if err != nil {
			return terror.New(err, "failed to insert other user")
		}
		err = AddAvatar(conn, u)
		if err != nil {
			return terror.New(err, "failed to insert avatar")
		}
	}

	return nil
}

func AddAvatar(conn *sqlx.DB, u *db.User) error {
	b, err := RandomAvatarBlob()
	// skip if failed to query avatar
	if err != nil {
		return nil
	}

	err = u.SetAvatar(conn, true, b)
	if err != nil {
		return terror.New(err, "failed to insert avatar")
	}

	return nil
}

// RandomAvatarBlob gets a random avatar image and returns a *db.Blob
func RandomAvatarBlob() (*db.Blob, error) {
	r, err := http.Get("https://randomuser.me/api/?inc=picture,gender&noinfo")
	if err != nil {
		return nil, terror.New(err, "get random avatar")
	}

	var result struct {
		Results []struct {
			Picture struct {
				Medium    string
				Large     string
				Thumbnail string
			}
		}
	}

	err = json.NewDecoder(r.Body).Decode(&result)
	if err != nil {
		return nil, terror.New(err, "decode json result")
	}
	if len(result.Results) == 0 {
		return nil, terror.New(fmt.Errorf("no results"), "")
	}

	url := result.Results[0].Picture.Medium

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return nil, terror.New(err, "get file from url")
	}
	defer resp.Body.Close()

	// Read file data
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, terror.New(terror.ErrParse, "parse error")
	}

	// Get mime type
	kind, err := filetype.Match(data)
	if err != nil {
		return nil, terror.New(terror.ErrParse, "parse error")
	}

	if kind == filetype.Unknown {
		return nil, terror.New(fmt.Errorf("Image type is unknown"), "Image type is unknown")
	}

	mimeType := kind.MIME.Value
	extension := kind.Extension

	// Create blob
	blob := &db.Blob{
		FileName:      "temp.jpg",
		MimeType:      mimeType,
		Extension:     extension,
		FileSizeBytes: int64(len(data)),
		File:          data,
	}

	return blob, nil
}

func Hubs(conn *sqlx.DB) error {
	h := db.Hub{
		Name:      "Ninja",
		IsPrivate: false,
	}
	err := h.Insert(conn, boil.Infer())
	if err != nil {
		return terror.New(err, "hubs")
	}

	// insert random hubs
	for i := 0; i < 5; i++ {
		h := db.Hub{
			Name:      faker.Company().Name(),
			IsPrivate: false,
		}
		err := h.Insert(conn, boil.Infer())
		if err != nil {
			return terror.New(err, "hubs")
		}
		if err != nil {
			return terror.New(err, "hubs")
		}
	}

	return nil
}
