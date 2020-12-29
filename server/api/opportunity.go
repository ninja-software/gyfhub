package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/gofrs/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
)

type OpportunityController struct {
	Conn    *sqlx.DB
	Auther  *gyfhub.Auther
	BlobURL string
}

func OpportunityRouter(conn *sqlx.DB, auther *gyfhub.Auther, jwtSecret string, blobURL string) chi.Router {
	c := &OpportunityController{
		conn,
		auther,
		blobURL,
	}
	r := chi.NewRouter()
	r.Post("/many", WithError(WithMember(conn, jwtSecret, c.OpportunityMany)))
	r.Post("/self", WithError(WithMember(conn, jwtSecret, c.OpportunitySelf)))
	r.Post("/create", WithError(WithMember(conn, jwtSecret, c.OpportunityCreate)))
	r.Get("/{id}", WithError(WithMember(conn, jwtSecret, c.OpportunityGet)))
	r.Post("/save", WithError(WithMember(conn, jwtSecret, c.OpportunitySave)))
	r.Post("/unsave", WithError(WithMember(conn, jwtSecret, c.OpportunityUnSave)))

	return r
}

type SaveRequest struct {
	OpportunityID uuid.UUID `json:"opportunityID"`
}

type OpportunitesManyResponse struct {
	Opportunites []*OpportunityDetail `json:"opportunities"`
	Total        int                  `json:"total"`
}

type OpportunityManyRequest struct {
	Search string        `json:"search"`
	Limit  int           `json:"limit"`
	Offset int           `json:"offset"`
	Filter *CategoryType `json:"filter"`
}

type OpportunityDetail struct {
	*db.Opportunity
	VideoURL  string      `json:"videoURL"`
	Owner     *UserDetail `json:"owner"`
	ExpiredAt time.Time   `json:"expiredAt"`
	IsFave    bool        `json:"isFave"`
}

// CategoryType const
type CategoryType string

const (
	CategoryTypeMoblie      CategoryType = "Moblie"
	CategoryTypeSocialMedia CategoryType = "Social Media"
	CategoryTypeWebsite     CategoryType = "Website"
)

func (e CategoryType) IsValid() bool {
	switch e {
	case CategoryTypeMoblie, CategoryTypeSocialMedia, CategoryTypeWebsite:
		return true
	}
	return false
}

func NewOpportunity(o *db.Opportunity, blobBaseURL string) *OpportunityDetail {
	return &OpportunityDetail{
		Opportunity: o,
		VideoURL:    blobBaseURL + o.VideoID,
		Owner:       NewUser(o.R.Business.R.Owner, blobBaseURL),
		ExpiredAt:   o.CreatedAt.AddDate(0, 0, 7),
	}
}

// OpportunityMany return a list of opportunities
func (c *OpportunityController) OpportunityMany(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &OpportunityManyRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid input")
	}
	defer r.Body.Close()

	search := req.Search
	limit := req.Limit
	offset := req.Offset

	queries := []qm.QueryMod{
		qm.Load(
			db.OpportunityRels.Users,
		),
		qm.Load(
			qm.Rels(
				db.OpportunityRels.Business,
				db.BusinessRels.Owner,
			),
		),
	}

	// join owner table
	queries = append(queries,
		qm.InnerJoin(
			fmt.Sprintf(
				"%[1]s ON %[1]s.%[2]s = %[3]s.%[4]s",
				db.TableNames.Businesses,
				db.BusinessColumns.ID,
				db.TableNames.Opportunities,
				db.OpportunityColumns.BusinessID,
			),
		),
		qm.InnerJoin(
			fmt.Sprintf(
				"%[1]s ON %[1]s.%[2]s = %[3]s.%[4]s",
				db.TableNames.Users,
				db.UserColumns.ID,
				db.TableNames.Businesses,
				db.BusinessColumns.OwnerID,
			),
		),
	)

	// Search
	if search != "" {
		searchKey := helpers.ParseQueryText(search)
		if len(searchKey) > 0 {
			queries = append(queries,
				qm.Where(
					fmt.Sprintf("(coalesce(%[1]s.%[3]s,'')) ||  (coalesce(%[2]s.%[3]s,'')) @@ to_tsquery( ? )",
						db.TableNames.Users,
						db.TableNames.Opportunities,
						db.OpportunityColumns.Keywords,
					),
					searchKey,
				),
			)
		}
	}

	// Filter
	if req.Filter.IsValid() {
		switch *req.Filter {
		case CategoryTypeMoblie:
		case CategoryTypeSocialMedia:
		case CategoryTypeWebsite:
		}
	}

	count, err := db.Opportunities(queries...).Count(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get many opportunities")
	}

	queries = append(queries, qm.Limit(limit), qm.Offset(offset))
	os, err := db.Opportunities(queries...).All(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get many opportunities")
	}

	resp := &OpportunitesManyResponse{
		Total: int(count),
	}
	for _, o := range os {
		newOp := NewOpportunity(o, c.BlobURL)
		newOp.IsFave = findIDInUserList(u.ID, o.R.Users)
		resp.Opportunites = append(resp.Opportunites, newOp)
	}

	return helpers.EncodeJSON(w, resp)
}

func findIDInUserList(id string, us db.UserSlice) bool {
	for _, u := range us {
		if u.ID == id {
			return true
		}
	}
	return false
}

type SelfOpportunityRequest struct {
	Limit             int  `json:"limit"`
	Offset            int  `json:"offset"`
	PastOpportunities bool `json:"pastOpportunities"`
}

// OpportunitySelf return opportunities which related to current user
func (c *OpportunityController) OpportunitySelf(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &SelfOpportunityRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid input")
	}

	defer r.Body.Close()

	var count int64
	var result []*db.Opportunity
	var business *db.Business

	if u.Type == string(Business) {
		business, err = db.Businesses(
			db.BusinessWhere.OwnerID.EQ(u.ID),
		).One(c.Conn)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "get self opportunities")
		}
	}

	queries := []qm.QueryMod{}

	// query total
	if business != nil {
		// query business own opportunities
		queries = append(queries,
			db.OpportunityWhere.BusinessID.EQ(business.ID),
		)
	}

	if req.PastOpportunities {
		queries = append(queries,
			db.OpportunityWhere.CreatedAt.LT(time.Now().AddDate(0, 0, -7)),
		)
	}

	if business != nil {
		// query business own opportunities
		count, err = db.Opportunities(queries...).Count(c.Conn)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "get self opportunities")
		}
	} else {
		// query user favorite opportunities
		count, err = u.Opportunities(queries...).Count(c.Conn)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "get self opportunities")
		}
	}

	// query opportunities
	queries = append(queries,
		qm.Load(
			qm.Rels(db.OpportunityRels.Business, db.BusinessRels.Owner),
		),
		qm.Limit(req.Limit),
		qm.Offset(req.Offset),
	)

	if business != nil {
		result, err = db.Opportunities(queries...).All(c.Conn)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "get self opportunities")
		}
	} else {
		result, err = u.Opportunities(queries...).All(c.Conn)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "get self opportunities")
		}
	}

	resp := &OpportunitesManyResponse{
		Total: int(count),
	}
	for _, o := range result {
		resp.Opportunites = append(resp.Opportunites, NewOpportunity(o, c.BlobURL))
	}

	return helpers.EncodeJSON(w, resp)
}

type OpportunityInput struct {
	Category           string    `json:"category"`
	Challenge          string    `json:"challenge"`
	RoleAfterChallenge string    `json:"roleAfterChallenge"`
	ConfirmYourCity    string    `json:"confirmYourCity"`
	OpenToRemoteTalent bool      `json:"openToRemoteTalent"`
	VideoID            uuid.UUID `json:"videoID"`
}

// OpportunityCreate create an opportunity
func (c *OpportunityController) OpportunityCreate(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &OpportunityInput{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid input")
	}
	defer r.Body.Close()

	// validation
	if u.Type != string(Business) {
		return http.StatusBadRequest, terror.New(fmt.Errorf("Only business account can create opportunities"), "create opportunities")
	}

	// query business
	b, err := db.Businesses(
		db.BusinessWhere.OwnerID.EQ(u.ID),
	).One(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "create opportunities")
	}

	// insert opportunites
	o := &db.Opportunity{
		BusinessID:         b.ID,
		VideoID:            req.VideoID.String(),
		Category:           req.Category,
		Challenge:          req.Challenge,
		RoleAfterChallenge: req.RoleAfterChallenge,
		ConfirmYourCity:    req.ConfirmYourCity,
		OpenToRemoteTalent: req.OpenToRemoteTalent,
	}

	err = o.Insert(c.Conn, boil.Infer())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "create opportunities")
	}

	return helpers.EncodeJSON(w, true)
}

func (c *OpportunityController) OpportunityGet(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	id := chi.URLParam(r, "id")
	if id == "" {
		return http.StatusBadRequest, terror.New(fmt.Errorf("no ID provided"), "")
	}

	o, err := db.Opportunities(
		db.OpportunityWhere.ID.EQ(id),
		qm.Load(
			db.OpportunityRels.Users,
		),
		qm.Load(
			qm.Rels(
				db.OpportunityRels.Business,
				db.BusinessRels.Owner,
			),
		),
	).One(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get one opportunities")
	}

	resp := NewOpportunity(o, c.BlobURL)
	resp.IsFave = findIDInUserList(u.ID, o.R.Users)

	return helpers.EncodeJSON(w, resp)
}

func (c *OpportunityController) OpportunitySave(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &SaveRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	// Checks if opportunity exists
	o, err := u.Opportunities(db.OpportunityWhere.ID.EQ(req.OpportunityID.String())).One(c.Conn)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return http.StatusBadRequest, terror.New(err, "query opportunity")
	}
	if o != nil {
		return http.StatusBadRequest, terror.New(fmt.Errorf("Already favourited"), "Favourite")
	}

	o, err = db.FindOpportunity(c.Conn, req.OpportunityID.String())
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "find opportunity")
	}

	err = o.AddUsers(c.Conn, false, u)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "add Favourite")
	}

	return helpers.EncodeJSON(w, true)
}

func (c *OpportunityController) OpportunityUnSave(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &SaveRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	// Checks if opportunity exists
	o, err := u.Opportunities(db.OpportunityWhere.ID.EQ(req.OpportunityID.String())).One(c.Conn)

	if err != nil && errors.Is(err, sql.ErrNoRows) {
		return http.StatusBadRequest, terror.New(err, "nothing to save")
	}

	if o == nil {
		return http.StatusBadRequest, terror.New(fmt.Errorf("Already saved"), "saved")
	}

	o, err = db.FindOpportunity(c.Conn, req.OpportunityID.String())
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "find opportunity")
	}

	err = o.RemoveUsers(c.Conn, u)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "unsave")
	}

	return helpers.EncodeJSON(w, true)
}
