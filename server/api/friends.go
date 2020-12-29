package api

import (
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/jmoiron/sqlx"
)

// UserController holds connection data for handlers
type FriendController struct {
	Conn    *sqlx.DB
	Auther  *gyfhub.Auther
	BlobURL string
}

func FriendRouter(
	conn *sqlx.DB,
	jwtSecret string,
	auther *gyfhub.Auther,
	blobURL string,
) chi.Router {
	c := &FriendController{
		conn,
		auther,
		blobURL,
	}

	r := chi.NewRouter()
	r.Post("/friendsList", WithError(WithMember(conn, jwtSecret, c.ListFriends)))
	// r.Post("/sendRequest", WithError(WithMember(conn, jwtSecret, c.)))
	// r.Post("/acceptRequest", WithError(WithMember(conn, jwtSecret, c.)))

	return r
}

type FriendsListRequest struct {
	Search string `json:"search"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
	Filter string `json:"filter"`
}

// OpportunityMany return a list of opportunities
func (c *FriendController) ListFriends(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	// 	req := &FriendsListRequest{}
	// 	err := json.NewDecoder(r.Body).Decode(req)
	// 	if err != nil {
	// 		return http.StatusBadRequest, terror.New(err, "invalid input")
	// 	}
	// 	defer r.Body.Close()

	// 	search := req.Search
	// 	limit := req.Limit
	// 	offset := req.Offset

	// 	queries := []qm.QueryMod{
	// 		qm.Load(
	// 			db.OpportunityRels.Users,
	// 		),
	// 		qm.Load(
	// 			qm.Rels(
	// 				db.OpportunityRels.Business,
	// 				db.BusinessRels.Owner,
	// 			),
	// 		),
	// 	}

	// 	// join owner table
	// 	queries = append(queries,
	// 		qm.InnerJoin(
	// 			fmt.Sprintf(
	// 				"%[1]s ON %[1]s.%[2]s = %[3]s.%[4]s",
	// 				db.TableNames.Businesses,
	// 				db.BusinessColumns.ID,
	// 				db.TableNames.Opportunities,
	// 				db.OpportunityColumns.BusinessID,
	// 			),
	// 		),
	// 		qm.InnerJoin(
	// 			fmt.Sprintf(
	// 				"%[1]s ON %[1]s.%[2]s = %[3]s.%[4]s",
	// 				db.TableNames.Users,
	// 				db.UserColumns.ID,
	// 				db.TableNames.Businesses,
	// 				db.BusinessColumns.OwnerID,
	// 			),
	// 		),
	// 	)

	// 	// Search
	// 	if search != "" {
	// 		searchKey := helpers.ParseQueryText(search)
	// 		if len(searchKey) > 0 {
	// 			queries = append(queries,
	// 				qm.Where(
	// 					fmt.Sprintf("(coalesce(%[1]s.%[3]s,'')) ||  (coalesce(%[2]s.%[3]s,'')) @@ to_tsquery( ? )",
	// 						db.TableNames.Users,
	// 						db.TableNames.Opportunities,
	// 						db.OpportunityColumns.Keywords,
	// 					),
	// 					searchKey,
	// 				),
	// 			)
	// 		}
	// 	}

	// 	// Filter
	// 	if req.Filter.IsValid() {
	// 		switch *req.Filter {
	// 		case CategoryTypeMoblie:
	// 		case CategoryTypeSocialMedia:
	// 		case CategoryTypeWebsite:
	// 		}
	// 	}

	// 	count, err := db.Opportunities(queries...).Count(c.Conn)
	// 	if err != nil {
	// 		return http.StatusInternalServerError, terror.New(err, "get many opportunities")
	// 	}

	// 	queries = append(queries, qm.Limit(limit), qm.Offset(offset))
	// 	os, err := db.Opportunities(queries...).All(c.Conn)
	// 	if err != nil {
	// 		return http.StatusInternalServerError, terror.New(err, "get many opportunities")
	// 	}

	// 	resp := &OpportunitesManyResponse{
	// 		Total: int(count),
	// 	}
	// 	for _, o := range os {
	// 		newOp := NewOpportunity(o, c.BlobURL)
	// 		newOp.IsFave = findIDInUserList(u.ID, o.R.Users)
	// 		resp.Opportunites = append(resp.Opportunites, newOp)
	// 	}

	// 	return helpers.EncodeJSON(w, resp)
	panic("")
}
