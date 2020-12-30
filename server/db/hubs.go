// Code generated by SQLBoiler 4.3.1 (https://github.com/volatiletech/sqlboiler). DO NOT EDIT.
// This file is meant to be re-generated in place and/or deleted at any time.

package db

import (
	"database/sql"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/friendsofgo/errors"
	"github.com/volatiletech/null/v8"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
	"github.com/volatiletech/sqlboiler/v4/queries/qmhelper"
	"github.com/volatiletech/strmangle"
)

// Hub is an object representing the database table.
type Hub struct {
	ID        string      `db:"id" boil:"id" json:"id" toml:"id" yaml:"id"`
	Name      string      `db:"name" boil:"name" json:"name" toml:"name" yaml:"name"`
	AvatarID  null.String `db:"avatar_id" boil:"avatar_id" json:"avatarID,omitempty" toml:"avatarID" yaml:"avatarID,omitempty"`
	IsPrivate bool        `db:"is_private" boil:"is_private" json:"isPrivate" toml:"isPrivate" yaml:"isPrivate"`
	DeletedAt null.Time   `db:"deleted_at" boil:"deleted_at" json:"deletedAt,omitempty" toml:"deletedAt" yaml:"deletedAt,omitempty"`
	UpdatedAt time.Time   `db:"updated_at" boil:"updated_at" json:"updatedAt" toml:"updatedAt" yaml:"updatedAt"`
	CreatedAt time.Time   `db:"created_at" boil:"created_at" json:"createdAt" toml:"createdAt" yaml:"createdAt"`

	R *hubR `db:"-" boil:"-" json:"-" toml:"-" yaml:"-"`
	L hubL  `db:"-" boil:"-" json:"-" toml:"-" yaml:"-"`
}

var HubColumns = struct {
	ID        string
	Name      string
	AvatarID  string
	IsPrivate string
	DeletedAt string
	UpdatedAt string
	CreatedAt string
}{
	ID:        "id",
	Name:      "name",
	AvatarID:  "avatar_id",
	IsPrivate: "is_private",
	DeletedAt: "deleted_at",
	UpdatedAt: "updated_at",
	CreatedAt: "created_at",
}

// Generated where

type whereHelpernull_String struct{ field string }

func (w whereHelpernull_String) EQ(x null.String) qm.QueryMod {
	return qmhelper.WhereNullEQ(w.field, false, x)
}
func (w whereHelpernull_String) NEQ(x null.String) qm.QueryMod {
	return qmhelper.WhereNullEQ(w.field, true, x)
}
func (w whereHelpernull_String) IsNull() qm.QueryMod    { return qmhelper.WhereIsNull(w.field) }
func (w whereHelpernull_String) IsNotNull() qm.QueryMod { return qmhelper.WhereIsNotNull(w.field) }
func (w whereHelpernull_String) LT(x null.String) qm.QueryMod {
	return qmhelper.Where(w.field, qmhelper.LT, x)
}
func (w whereHelpernull_String) LTE(x null.String) qm.QueryMod {
	return qmhelper.Where(w.field, qmhelper.LTE, x)
}
func (w whereHelpernull_String) GT(x null.String) qm.QueryMod {
	return qmhelper.Where(w.field, qmhelper.GT, x)
}
func (w whereHelpernull_String) GTE(x null.String) qm.QueryMod {
	return qmhelper.Where(w.field, qmhelper.GTE, x)
}

type whereHelperbool struct{ field string }

func (w whereHelperbool) EQ(x bool) qm.QueryMod  { return qmhelper.Where(w.field, qmhelper.EQ, x) }
func (w whereHelperbool) NEQ(x bool) qm.QueryMod { return qmhelper.Where(w.field, qmhelper.NEQ, x) }
func (w whereHelperbool) LT(x bool) qm.QueryMod  { return qmhelper.Where(w.field, qmhelper.LT, x) }
func (w whereHelperbool) LTE(x bool) qm.QueryMod { return qmhelper.Where(w.field, qmhelper.LTE, x) }
func (w whereHelperbool) GT(x bool) qm.QueryMod  { return qmhelper.Where(w.field, qmhelper.GT, x) }
func (w whereHelperbool) GTE(x bool) qm.QueryMod { return qmhelper.Where(w.field, qmhelper.GTE, x) }

var HubWhere = struct {
	ID        whereHelperstring
	Name      whereHelperstring
	AvatarID  whereHelpernull_String
	IsPrivate whereHelperbool
	DeletedAt whereHelpernull_Time
	UpdatedAt whereHelpertime_Time
	CreatedAt whereHelpertime_Time
}{
	ID:        whereHelperstring{field: "\"hubs\".\"id\""},
	Name:      whereHelperstring{field: "\"hubs\".\"name\""},
	AvatarID:  whereHelpernull_String{field: "\"hubs\".\"avatar_id\""},
	IsPrivate: whereHelperbool{field: "\"hubs\".\"is_private\""},
	DeletedAt: whereHelpernull_Time{field: "\"hubs\".\"deleted_at\""},
	UpdatedAt: whereHelpertime_Time{field: "\"hubs\".\"updated_at\""},
	CreatedAt: whereHelpertime_Time{field: "\"hubs\".\"created_at\""},
}

// HubRels is where relationship names are stored.
var HubRels = struct {
	Avatar   string
	Messages string
}{
	Avatar:   "Avatar",
	Messages: "Messages",
}

// hubR is where relationships are stored.
type hubR struct {
	Avatar   *Blob        `db:"Avatar" boil:"Avatar" json:"Avatar" toml:"Avatar" yaml:"Avatar"`
	Messages MessageSlice `db:"Messages" boil:"Messages" json:"Messages" toml:"Messages" yaml:"Messages"`
}

// NewStruct creates a new relationship struct
func (*hubR) NewStruct() *hubR {
	return &hubR{}
}

// hubL is where Load methods for each relationship are stored.
type hubL struct{}

var (
	hubAllColumns            = []string{"id", "name", "avatar_id", "is_private", "deleted_at", "updated_at", "created_at"}
	hubColumnsWithoutDefault = []string{"name", "avatar_id", "deleted_at"}
	hubColumnsWithDefault    = []string{"id", "is_private", "updated_at", "created_at"}
	hubPrimaryKeyColumns     = []string{"id"}
)

type (
	// HubSlice is an alias for a slice of pointers to Hub.
	// This should generally be used opposed to []Hub.
	HubSlice []*Hub
	// HubHook is the signature for custom Hub hook methods
	HubHook func(boil.Executor, *Hub) error

	hubQuery struct {
		*queries.Query
	}
)

// Cache for insert, update and upsert
var (
	hubType                 = reflect.TypeOf(&Hub{})
	hubMapping              = queries.MakeStructMapping(hubType)
	hubPrimaryKeyMapping, _ = queries.BindMapping(hubType, hubMapping, hubPrimaryKeyColumns)
	hubInsertCacheMut       sync.RWMutex
	hubInsertCache          = make(map[string]insertCache)
	hubUpdateCacheMut       sync.RWMutex
	hubUpdateCache          = make(map[string]updateCache)
	hubUpsertCacheMut       sync.RWMutex
	hubUpsertCache          = make(map[string]insertCache)
)

var (
	// Force time package dependency for automated UpdatedAt/CreatedAt.
	_ = time.Second
	// Force qmhelper dependency for where clause generation (which doesn't
	// always happen)
	_ = qmhelper.Where
)

var hubBeforeInsertHooks []HubHook
var hubBeforeUpdateHooks []HubHook
var hubBeforeDeleteHooks []HubHook
var hubBeforeUpsertHooks []HubHook

var hubAfterInsertHooks []HubHook
var hubAfterSelectHooks []HubHook
var hubAfterUpdateHooks []HubHook
var hubAfterDeleteHooks []HubHook
var hubAfterUpsertHooks []HubHook

// doBeforeInsertHooks executes all "before insert" hooks.
func (o *Hub) doBeforeInsertHooks(exec boil.Executor) (err error) {
	for _, hook := range hubBeforeInsertHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// doBeforeUpdateHooks executes all "before Update" hooks.
func (o *Hub) doBeforeUpdateHooks(exec boil.Executor) (err error) {
	for _, hook := range hubBeforeUpdateHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// doBeforeDeleteHooks executes all "before Delete" hooks.
func (o *Hub) doBeforeDeleteHooks(exec boil.Executor) (err error) {
	for _, hook := range hubBeforeDeleteHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// doBeforeUpsertHooks executes all "before Upsert" hooks.
func (o *Hub) doBeforeUpsertHooks(exec boil.Executor) (err error) {
	for _, hook := range hubBeforeUpsertHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// doAfterInsertHooks executes all "after Insert" hooks.
func (o *Hub) doAfterInsertHooks(exec boil.Executor) (err error) {
	for _, hook := range hubAfterInsertHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// doAfterSelectHooks executes all "after Select" hooks.
func (o *Hub) doAfterSelectHooks(exec boil.Executor) (err error) {
	for _, hook := range hubAfterSelectHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// doAfterUpdateHooks executes all "after Update" hooks.
func (o *Hub) doAfterUpdateHooks(exec boil.Executor) (err error) {
	for _, hook := range hubAfterUpdateHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// doAfterDeleteHooks executes all "after Delete" hooks.
func (o *Hub) doAfterDeleteHooks(exec boil.Executor) (err error) {
	for _, hook := range hubAfterDeleteHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// doAfterUpsertHooks executes all "after Upsert" hooks.
func (o *Hub) doAfterUpsertHooks(exec boil.Executor) (err error) {
	for _, hook := range hubAfterUpsertHooks {
		if err := hook(exec, o); err != nil {
			return err
		}
	}

	return nil
}

// AddHubHook registers your hook function for all future operations.
func AddHubHook(hookPoint boil.HookPoint, hubHook HubHook) {
	switch hookPoint {
	case boil.BeforeInsertHook:
		hubBeforeInsertHooks = append(hubBeforeInsertHooks, hubHook)
	case boil.BeforeUpdateHook:
		hubBeforeUpdateHooks = append(hubBeforeUpdateHooks, hubHook)
	case boil.BeforeDeleteHook:
		hubBeforeDeleteHooks = append(hubBeforeDeleteHooks, hubHook)
	case boil.BeforeUpsertHook:
		hubBeforeUpsertHooks = append(hubBeforeUpsertHooks, hubHook)
	case boil.AfterInsertHook:
		hubAfterInsertHooks = append(hubAfterInsertHooks, hubHook)
	case boil.AfterSelectHook:
		hubAfterSelectHooks = append(hubAfterSelectHooks, hubHook)
	case boil.AfterUpdateHook:
		hubAfterUpdateHooks = append(hubAfterUpdateHooks, hubHook)
	case boil.AfterDeleteHook:
		hubAfterDeleteHooks = append(hubAfterDeleteHooks, hubHook)
	case boil.AfterUpsertHook:
		hubAfterUpsertHooks = append(hubAfterUpsertHooks, hubHook)
	}
}

// One returns a single hub record from the query.
func (q hubQuery) One(exec boil.Executor) (*Hub, error) {
	o := &Hub{}

	queries.SetLimit(q.Query, 1)

	err := q.Bind(nil, exec, o)
	if err != nil {
		if errors.Cause(err) == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		return nil, errors.Wrap(err, "db: failed to execute a one query for hubs")
	}

	if err := o.doAfterSelectHooks(exec); err != nil {
		return o, err
	}

	return o, nil
}

// All returns all Hub records from the query.
func (q hubQuery) All(exec boil.Executor) (HubSlice, error) {
	var o []*Hub

	err := q.Bind(nil, exec, &o)
	if err != nil {
		return nil, errors.Wrap(err, "db: failed to assign all query results to Hub slice")
	}

	if len(hubAfterSelectHooks) != 0 {
		for _, obj := range o {
			if err := obj.doAfterSelectHooks(exec); err != nil {
				return o, err
			}
		}
	}

	return o, nil
}

// Count returns the count of all Hub records in the query.
func (q hubQuery) Count(exec boil.Executor) (int64, error) {
	var count int64

	queries.SetSelect(q.Query, nil)
	queries.SetCount(q.Query)

	err := q.Query.QueryRow(exec).Scan(&count)
	if err != nil {
		return 0, errors.Wrap(err, "db: failed to count hubs rows")
	}

	return count, nil
}

// Exists checks if the row exists in the table.
func (q hubQuery) Exists(exec boil.Executor) (bool, error) {
	var count int64

	queries.SetSelect(q.Query, nil)
	queries.SetCount(q.Query)
	queries.SetLimit(q.Query, 1)

	err := q.Query.QueryRow(exec).Scan(&count)
	if err != nil {
		return false, errors.Wrap(err, "db: failed to check if hubs exists")
	}

	return count > 0, nil
}

// Avatar pointed to by the foreign key.
func (o *Hub) Avatar(mods ...qm.QueryMod) blobQuery {
	queryMods := []qm.QueryMod{
		qm.Where("\"id\" = ?", o.AvatarID),
	}

	queryMods = append(queryMods, mods...)

	query := Blobs(queryMods...)
	queries.SetFrom(query.Query, "\"blobs\"")

	return query
}

// Messages retrieves all the message's Messages with an executor.
func (o *Hub) Messages(mods ...qm.QueryMod) messageQuery {
	var queryMods []qm.QueryMod
	if len(mods) != 0 {
		queryMods = append(queryMods, mods...)
	}

	queryMods = append(queryMods,
		qm.Where("\"messages\".\"hub_id\"=?", o.ID),
	)

	query := Messages(queryMods...)
	queries.SetFrom(query.Query, "\"messages\"")

	if len(queries.GetSelect(query.Query)) == 0 {
		queries.SetSelect(query.Query, []string{"\"messages\".*"})
	}

	return query
}

// LoadAvatar allows an eager lookup of values, cached into the
// loaded structs of the objects. This is for an N-1 relationship.
func (hubL) LoadAvatar(e boil.Executor, singular bool, maybeHub interface{}, mods queries.Applicator) error {
	var slice []*Hub
	var object *Hub

	if singular {
		object = maybeHub.(*Hub)
	} else {
		slice = *maybeHub.(*[]*Hub)
	}

	args := make([]interface{}, 0, 1)
	if singular {
		if object.R == nil {
			object.R = &hubR{}
		}
		if !queries.IsNil(object.AvatarID) {
			args = append(args, object.AvatarID)
		}

	} else {
	Outer:
		for _, obj := range slice {
			if obj.R == nil {
				obj.R = &hubR{}
			}

			for _, a := range args {
				if queries.Equal(a, obj.AvatarID) {
					continue Outer
				}
			}

			if !queries.IsNil(obj.AvatarID) {
				args = append(args, obj.AvatarID)
			}

		}
	}

	if len(args) == 0 {
		return nil
	}

	query := NewQuery(
		qm.From(`blobs`),
		qm.WhereIn(`blobs.id in ?`, args...),
	)
	if mods != nil {
		mods.Apply(query)
	}

	results, err := query.Query(e)
	if err != nil {
		return errors.Wrap(err, "failed to eager load Blob")
	}

	var resultSlice []*Blob
	if err = queries.Bind(results, &resultSlice); err != nil {
		return errors.Wrap(err, "failed to bind eager loaded slice Blob")
	}

	if err = results.Close(); err != nil {
		return errors.Wrap(err, "failed to close results of eager load for blobs")
	}
	if err = results.Err(); err != nil {
		return errors.Wrap(err, "error occurred during iteration of eager loaded relations for blobs")
	}

	if len(hubAfterSelectHooks) != 0 {
		for _, obj := range resultSlice {
			if err := obj.doAfterSelectHooks(e); err != nil {
				return err
			}
		}
	}

	if len(resultSlice) == 0 {
		return nil
	}

	if singular {
		foreign := resultSlice[0]
		object.R.Avatar = foreign
		if foreign.R == nil {
			foreign.R = &blobR{}
		}
		foreign.R.AvatarHubs = append(foreign.R.AvatarHubs, object)
		return nil
	}

	for _, local := range slice {
		for _, foreign := range resultSlice {
			if queries.Equal(local.AvatarID, foreign.ID) {
				local.R.Avatar = foreign
				if foreign.R == nil {
					foreign.R = &blobR{}
				}
				foreign.R.AvatarHubs = append(foreign.R.AvatarHubs, local)
				break
			}
		}
	}

	return nil
}

// LoadMessages allows an eager lookup of values, cached into the
// loaded structs of the objects. This is for a 1-M or N-M relationship.
func (hubL) LoadMessages(e boil.Executor, singular bool, maybeHub interface{}, mods queries.Applicator) error {
	var slice []*Hub
	var object *Hub

	if singular {
		object = maybeHub.(*Hub)
	} else {
		slice = *maybeHub.(*[]*Hub)
	}

	args := make([]interface{}, 0, 1)
	if singular {
		if object.R == nil {
			object.R = &hubR{}
		}
		args = append(args, object.ID)
	} else {
	Outer:
		for _, obj := range slice {
			if obj.R == nil {
				obj.R = &hubR{}
			}

			for _, a := range args {
				if a == obj.ID {
					continue Outer
				}
			}

			args = append(args, obj.ID)
		}
	}

	if len(args) == 0 {
		return nil
	}

	query := NewQuery(
		qm.From(`messages`),
		qm.WhereIn(`messages.hub_id in ?`, args...),
	)
	if mods != nil {
		mods.Apply(query)
	}

	results, err := query.Query(e)
	if err != nil {
		return errors.Wrap(err, "failed to eager load messages")
	}

	var resultSlice []*Message
	if err = queries.Bind(results, &resultSlice); err != nil {
		return errors.Wrap(err, "failed to bind eager loaded slice messages")
	}

	if err = results.Close(); err != nil {
		return errors.Wrap(err, "failed to close results in eager load on messages")
	}
	if err = results.Err(); err != nil {
		return errors.Wrap(err, "error occurred during iteration of eager loaded relations for messages")
	}

	if len(messageAfterSelectHooks) != 0 {
		for _, obj := range resultSlice {
			if err := obj.doAfterSelectHooks(e); err != nil {
				return err
			}
		}
	}
	if singular {
		object.R.Messages = resultSlice
		for _, foreign := range resultSlice {
			if foreign.R == nil {
				foreign.R = &messageR{}
			}
			foreign.R.Hub = object
		}
		return nil
	}

	for _, foreign := range resultSlice {
		for _, local := range slice {
			if local.ID == foreign.HubID {
				local.R.Messages = append(local.R.Messages, foreign)
				if foreign.R == nil {
					foreign.R = &messageR{}
				}
				foreign.R.Hub = local
				break
			}
		}
	}

	return nil
}

// SetAvatar of the hub to the related item.
// Sets o.R.Avatar to related.
// Adds o to related.R.AvatarHubs.
func (o *Hub) SetAvatar(exec boil.Executor, insert bool, related *Blob) error {
	var err error
	if insert {
		if err = related.Insert(exec, boil.Infer()); err != nil {
			return errors.Wrap(err, "failed to insert into foreign table")
		}
	}

	updateQuery := fmt.Sprintf(
		"UPDATE \"hubs\" SET %s WHERE %s",
		strmangle.SetParamNames("\"", "\"", 1, []string{"avatar_id"}),
		strmangle.WhereClause("\"", "\"", 2, hubPrimaryKeyColumns),
	)
	values := []interface{}{related.ID, o.ID}

	if boil.DebugMode {
		fmt.Fprintln(boil.DebugWriter, updateQuery)
		fmt.Fprintln(boil.DebugWriter, values)
	}
	if _, err = exec.Exec(updateQuery, values...); err != nil {
		return errors.Wrap(err, "failed to update local table")
	}

	queries.Assign(&o.AvatarID, related.ID)
	if o.R == nil {
		o.R = &hubR{
			Avatar: related,
		}
	} else {
		o.R.Avatar = related
	}

	if related.R == nil {
		related.R = &blobR{
			AvatarHubs: HubSlice{o},
		}
	} else {
		related.R.AvatarHubs = append(related.R.AvatarHubs, o)
	}

	return nil
}

// RemoveAvatar relationship.
// Sets o.R.Avatar to nil.
// Removes o from all passed in related items' relationships struct (Optional).
func (o *Hub) RemoveAvatar(exec boil.Executor, related *Blob) error {
	var err error

	queries.SetScanner(&o.AvatarID, nil)
	if _, err = o.Update(exec, boil.Whitelist("avatar_id")); err != nil {
		return errors.Wrap(err, "failed to update local table")
	}

	if o.R != nil {
		o.R.Avatar = nil
	}
	if related == nil || related.R == nil {
		return nil
	}

	for i, ri := range related.R.AvatarHubs {
		if queries.Equal(o.AvatarID, ri.AvatarID) {
			continue
		}

		ln := len(related.R.AvatarHubs)
		if ln > 1 && i < ln-1 {
			related.R.AvatarHubs[i] = related.R.AvatarHubs[ln-1]
		}
		related.R.AvatarHubs = related.R.AvatarHubs[:ln-1]
		break
	}
	return nil
}

// AddMessages adds the given related objects to the existing relationships
// of the hub, optionally inserting them as new records.
// Appends related to o.R.Messages.
// Sets related.R.Hub appropriately.
func (o *Hub) AddMessages(exec boil.Executor, insert bool, related ...*Message) error {
	var err error
	for _, rel := range related {
		if insert {
			rel.HubID = o.ID
			if err = rel.Insert(exec, boil.Infer()); err != nil {
				return errors.Wrap(err, "failed to insert into foreign table")
			}
		} else {
			updateQuery := fmt.Sprintf(
				"UPDATE \"messages\" SET %s WHERE %s",
				strmangle.SetParamNames("\"", "\"", 1, []string{"hub_id"}),
				strmangle.WhereClause("\"", "\"", 2, messagePrimaryKeyColumns),
			)
			values := []interface{}{o.ID, rel.ID}

			if boil.DebugMode {
				fmt.Fprintln(boil.DebugWriter, updateQuery)
				fmt.Fprintln(boil.DebugWriter, values)
			}
			if _, err = exec.Exec(updateQuery, values...); err != nil {
				return errors.Wrap(err, "failed to update foreign table")
			}

			rel.HubID = o.ID
		}
	}

	if o.R == nil {
		o.R = &hubR{
			Messages: related,
		}
	} else {
		o.R.Messages = append(o.R.Messages, related...)
	}

	for _, rel := range related {
		if rel.R == nil {
			rel.R = &messageR{
				Hub: o,
			}
		} else {
			rel.R.Hub = o
		}
	}
	return nil
}

// Hubs retrieves all the records using an executor.
func Hubs(mods ...qm.QueryMod) hubQuery {
	mods = append(mods, qm.From("\"hubs\""))
	return hubQuery{NewQuery(mods...)}
}

// FindHub retrieves a single record by ID with an executor.
// If selectCols is empty Find will return all columns.
func FindHub(exec boil.Executor, iD string, selectCols ...string) (*Hub, error) {
	hubObj := &Hub{}

	sel := "*"
	if len(selectCols) > 0 {
		sel = strings.Join(strmangle.IdentQuoteSlice(dialect.LQ, dialect.RQ, selectCols), ",")
	}
	query := fmt.Sprintf(
		"select %s from \"hubs\" where \"id\"=$1", sel,
	)

	q := queries.Raw(query, iD)

	err := q.Bind(nil, exec, hubObj)
	if err != nil {
		if errors.Cause(err) == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		return nil, errors.Wrap(err, "db: unable to select from hubs")
	}

	return hubObj, nil
}

// Insert a single record using an executor.
// See boil.Columns.InsertColumnSet documentation to understand column list inference for inserts.
func (o *Hub) Insert(exec boil.Executor, columns boil.Columns) error {
	if o == nil {
		return errors.New("db: no hubs provided for insertion")
	}

	var err error
	currTime := time.Now().In(boil.GetLocation())

	if o.UpdatedAt.IsZero() {
		o.UpdatedAt = currTime
	}
	if o.CreatedAt.IsZero() {
		o.CreatedAt = currTime
	}

	if err := o.doBeforeInsertHooks(exec); err != nil {
		return err
	}

	nzDefaults := queries.NonZeroDefaultSet(hubColumnsWithDefault, o)

	key := makeCacheKey(columns, nzDefaults)
	hubInsertCacheMut.RLock()
	cache, cached := hubInsertCache[key]
	hubInsertCacheMut.RUnlock()

	if !cached {
		wl, returnColumns := columns.InsertColumnSet(
			hubAllColumns,
			hubColumnsWithDefault,
			hubColumnsWithoutDefault,
			nzDefaults,
		)

		cache.valueMapping, err = queries.BindMapping(hubType, hubMapping, wl)
		if err != nil {
			return err
		}
		cache.retMapping, err = queries.BindMapping(hubType, hubMapping, returnColumns)
		if err != nil {
			return err
		}
		if len(wl) != 0 {
			cache.query = fmt.Sprintf("INSERT INTO \"hubs\" (\"%s\") %%sVALUES (%s)%%s", strings.Join(wl, "\",\""), strmangle.Placeholders(dialect.UseIndexPlaceholders, len(wl), 1, 1))
		} else {
			cache.query = "INSERT INTO \"hubs\" %sDEFAULT VALUES%s"
		}

		var queryOutput, queryReturning string

		if len(cache.retMapping) != 0 {
			queryReturning = fmt.Sprintf(" RETURNING \"%s\"", strings.Join(returnColumns, "\",\""))
		}

		cache.query = fmt.Sprintf(cache.query, queryOutput, queryReturning)
	}

	value := reflect.Indirect(reflect.ValueOf(o))
	vals := queries.ValuesFromMapping(value, cache.valueMapping)

	if boil.DebugMode {
		fmt.Fprintln(boil.DebugWriter, cache.query)
		fmt.Fprintln(boil.DebugWriter, vals)
	}

	if len(cache.retMapping) != 0 {
		err = exec.QueryRow(cache.query, vals...).Scan(queries.PtrsFromMapping(value, cache.retMapping)...)
	} else {
		_, err = exec.Exec(cache.query, vals...)
	}

	if err != nil {
		return errors.Wrap(err, "db: unable to insert into hubs")
	}

	if !cached {
		hubInsertCacheMut.Lock()
		hubInsertCache[key] = cache
		hubInsertCacheMut.Unlock()
	}

	return o.doAfterInsertHooks(exec)
}

// Update uses an executor to update the Hub.
// See boil.Columns.UpdateColumnSet documentation to understand column list inference for updates.
// Update does not automatically update the record in case of default values. Use .Reload() to refresh the records.
func (o *Hub) Update(exec boil.Executor, columns boil.Columns) (int64, error) {
	currTime := time.Now().In(boil.GetLocation())

	o.UpdatedAt = currTime

	var err error
	if err = o.doBeforeUpdateHooks(exec); err != nil {
		return 0, err
	}
	key := makeCacheKey(columns, nil)
	hubUpdateCacheMut.RLock()
	cache, cached := hubUpdateCache[key]
	hubUpdateCacheMut.RUnlock()

	if !cached {
		wl := columns.UpdateColumnSet(
			hubAllColumns,
			hubPrimaryKeyColumns,
		)

		if !columns.IsWhitelist() {
			wl = strmangle.SetComplement(wl, []string{"created_at"})
		}
		if len(wl) == 0 {
			return 0, errors.New("db: unable to update hubs, could not build whitelist")
		}

		cache.query = fmt.Sprintf("UPDATE \"hubs\" SET %s WHERE %s",
			strmangle.SetParamNames("\"", "\"", 1, wl),
			strmangle.WhereClause("\"", "\"", len(wl)+1, hubPrimaryKeyColumns),
		)
		cache.valueMapping, err = queries.BindMapping(hubType, hubMapping, append(wl, hubPrimaryKeyColumns...))
		if err != nil {
			return 0, err
		}
	}

	values := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(o)), cache.valueMapping)

	if boil.DebugMode {
		fmt.Fprintln(boil.DebugWriter, cache.query)
		fmt.Fprintln(boil.DebugWriter, values)
	}
	var result sql.Result
	result, err = exec.Exec(cache.query, values...)
	if err != nil {
		return 0, errors.Wrap(err, "db: unable to update hubs row")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "db: failed to get rows affected by update for hubs")
	}

	if !cached {
		hubUpdateCacheMut.Lock()
		hubUpdateCache[key] = cache
		hubUpdateCacheMut.Unlock()
	}

	return rowsAff, o.doAfterUpdateHooks(exec)
}

// UpdateAll updates all rows with the specified column values.
func (q hubQuery) UpdateAll(exec boil.Executor, cols M) (int64, error) {
	queries.SetUpdate(q.Query, cols)

	result, err := q.Query.Exec(exec)
	if err != nil {
		return 0, errors.Wrap(err, "db: unable to update all for hubs")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "db: unable to retrieve rows affected for hubs")
	}

	return rowsAff, nil
}

// UpdateAll updates all rows with the specified column values, using an executor.
func (o HubSlice) UpdateAll(exec boil.Executor, cols M) (int64, error) {
	ln := int64(len(o))
	if ln == 0 {
		return 0, nil
	}

	if len(cols) == 0 {
		return 0, errors.New("db: update all requires at least one column argument")
	}

	colNames := make([]string, len(cols))
	args := make([]interface{}, len(cols))

	i := 0
	for name, value := range cols {
		colNames[i] = name
		args[i] = value
		i++
	}

	// Append all of the primary key values for each column
	for _, obj := range o {
		pkeyArgs := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(obj)), hubPrimaryKeyMapping)
		args = append(args, pkeyArgs...)
	}

	sql := fmt.Sprintf("UPDATE \"hubs\" SET %s WHERE %s",
		strmangle.SetParamNames("\"", "\"", 1, colNames),
		strmangle.WhereClauseRepeated(string(dialect.LQ), string(dialect.RQ), len(colNames)+1, hubPrimaryKeyColumns, len(o)))

	if boil.DebugMode {
		fmt.Fprintln(boil.DebugWriter, sql)
		fmt.Fprintln(boil.DebugWriter, args...)
	}
	result, err := exec.Exec(sql, args...)
	if err != nil {
		return 0, errors.Wrap(err, "db: unable to update all in hub slice")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "db: unable to retrieve rows affected all in update all hub")
	}
	return rowsAff, nil
}

// Upsert attempts an insert using an executor, and does an update or ignore on conflict.
// See boil.Columns documentation for how to properly use updateColumns and insertColumns.
func (o *Hub) Upsert(exec boil.Executor, updateOnConflict bool, conflictColumns []string, updateColumns, insertColumns boil.Columns) error {
	if o == nil {
		return errors.New("db: no hubs provided for upsert")
	}
	currTime := time.Now().In(boil.GetLocation())

	o.UpdatedAt = currTime
	if o.CreatedAt.IsZero() {
		o.CreatedAt = currTime
	}

	if err := o.doBeforeUpsertHooks(exec); err != nil {
		return err
	}

	nzDefaults := queries.NonZeroDefaultSet(hubColumnsWithDefault, o)

	// Build cache key in-line uglily - mysql vs psql problems
	buf := strmangle.GetBuffer()
	if updateOnConflict {
		buf.WriteByte('t')
	} else {
		buf.WriteByte('f')
	}
	buf.WriteByte('.')
	for _, c := range conflictColumns {
		buf.WriteString(c)
	}
	buf.WriteByte('.')
	buf.WriteString(strconv.Itoa(updateColumns.Kind))
	for _, c := range updateColumns.Cols {
		buf.WriteString(c)
	}
	buf.WriteByte('.')
	buf.WriteString(strconv.Itoa(insertColumns.Kind))
	for _, c := range insertColumns.Cols {
		buf.WriteString(c)
	}
	buf.WriteByte('.')
	for _, c := range nzDefaults {
		buf.WriteString(c)
	}
	key := buf.String()
	strmangle.PutBuffer(buf)

	hubUpsertCacheMut.RLock()
	cache, cached := hubUpsertCache[key]
	hubUpsertCacheMut.RUnlock()

	var err error

	if !cached {
		insert, ret := insertColumns.InsertColumnSet(
			hubAllColumns,
			hubColumnsWithDefault,
			hubColumnsWithoutDefault,
			nzDefaults,
		)
		update := updateColumns.UpdateColumnSet(
			hubAllColumns,
			hubPrimaryKeyColumns,
		)

		if updateOnConflict && len(update) == 0 {
			return errors.New("db: unable to upsert hubs, could not build update column list")
		}

		conflict := conflictColumns
		if len(conflict) == 0 {
			conflict = make([]string, len(hubPrimaryKeyColumns))
			copy(conflict, hubPrimaryKeyColumns)
		}
		cache.query = buildUpsertQueryPostgres(dialect, "\"hubs\"", updateOnConflict, ret, update, conflict, insert)

		cache.valueMapping, err = queries.BindMapping(hubType, hubMapping, insert)
		if err != nil {
			return err
		}
		if len(ret) != 0 {
			cache.retMapping, err = queries.BindMapping(hubType, hubMapping, ret)
			if err != nil {
				return err
			}
		}
	}

	value := reflect.Indirect(reflect.ValueOf(o))
	vals := queries.ValuesFromMapping(value, cache.valueMapping)
	var returns []interface{}
	if len(cache.retMapping) != 0 {
		returns = queries.PtrsFromMapping(value, cache.retMapping)
	}

	if boil.DebugMode {
		fmt.Fprintln(boil.DebugWriter, cache.query)
		fmt.Fprintln(boil.DebugWriter, vals)
	}
	if len(cache.retMapping) != 0 {
		err = exec.QueryRow(cache.query, vals...).Scan(returns...)
		if err == sql.ErrNoRows {
			err = nil // Postgres doesn't return anything when there's no update
		}
	} else {
		_, err = exec.Exec(cache.query, vals...)
	}
	if err != nil {
		return errors.Wrap(err, "db: unable to upsert hubs")
	}

	if !cached {
		hubUpsertCacheMut.Lock()
		hubUpsertCache[key] = cache
		hubUpsertCacheMut.Unlock()
	}

	return o.doAfterUpsertHooks(exec)
}

// Delete deletes a single Hub record with an executor.
// Delete will match against the primary key column to find the record to delete.
func (o *Hub) Delete(exec boil.Executor) (int64, error) {
	if o == nil {
		return 0, errors.New("db: no Hub provided for delete")
	}

	if err := o.doBeforeDeleteHooks(exec); err != nil {
		return 0, err
	}

	args := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(o)), hubPrimaryKeyMapping)
	sql := "DELETE FROM \"hubs\" WHERE \"id\"=$1"

	if boil.DebugMode {
		fmt.Fprintln(boil.DebugWriter, sql)
		fmt.Fprintln(boil.DebugWriter, args...)
	}
	result, err := exec.Exec(sql, args...)
	if err != nil {
		return 0, errors.Wrap(err, "db: unable to delete from hubs")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "db: failed to get rows affected by delete for hubs")
	}

	if err := o.doAfterDeleteHooks(exec); err != nil {
		return 0, err
	}

	return rowsAff, nil
}

// DeleteAll deletes all matching rows.
func (q hubQuery) DeleteAll(exec boil.Executor) (int64, error) {
	if q.Query == nil {
		return 0, errors.New("db: no hubQuery provided for delete all")
	}

	queries.SetDelete(q.Query)

	result, err := q.Query.Exec(exec)
	if err != nil {
		return 0, errors.Wrap(err, "db: unable to delete all from hubs")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "db: failed to get rows affected by deleteall for hubs")
	}

	return rowsAff, nil
}

// DeleteAll deletes all rows in the slice, using an executor.
func (o HubSlice) DeleteAll(exec boil.Executor) (int64, error) {
	if len(o) == 0 {
		return 0, nil
	}

	if len(hubBeforeDeleteHooks) != 0 {
		for _, obj := range o {
			if err := obj.doBeforeDeleteHooks(exec); err != nil {
				return 0, err
			}
		}
	}

	var args []interface{}
	for _, obj := range o {
		pkeyArgs := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(obj)), hubPrimaryKeyMapping)
		args = append(args, pkeyArgs...)
	}

	sql := "DELETE FROM \"hubs\" WHERE " +
		strmangle.WhereClauseRepeated(string(dialect.LQ), string(dialect.RQ), 1, hubPrimaryKeyColumns, len(o))

	if boil.DebugMode {
		fmt.Fprintln(boil.DebugWriter, sql)
		fmt.Fprintln(boil.DebugWriter, args)
	}
	result, err := exec.Exec(sql, args...)
	if err != nil {
		return 0, errors.Wrap(err, "db: unable to delete all from hub slice")
	}

	rowsAff, err := result.RowsAffected()
	if err != nil {
		return 0, errors.Wrap(err, "db: failed to get rows affected by deleteall for hubs")
	}

	if len(hubAfterDeleteHooks) != 0 {
		for _, obj := range o {
			if err := obj.doAfterDeleteHooks(exec); err != nil {
				return 0, err
			}
		}
	}

	return rowsAff, nil
}

// Reload refetches the object from the database
// using the primary keys with an executor.
func (o *Hub) Reload(exec boil.Executor) error {
	ret, err := FindHub(exec, o.ID)
	if err != nil {
		return err
	}

	*o = *ret
	return nil
}

// ReloadAll refetches every row with matching primary key column values
// and overwrites the original object slice with the newly updated slice.
func (o *HubSlice) ReloadAll(exec boil.Executor) error {
	if o == nil || len(*o) == 0 {
		return nil
	}

	slice := HubSlice{}
	var args []interface{}
	for _, obj := range *o {
		pkeyArgs := queries.ValuesFromMapping(reflect.Indirect(reflect.ValueOf(obj)), hubPrimaryKeyMapping)
		args = append(args, pkeyArgs...)
	}

	sql := "SELECT \"hubs\".* FROM \"hubs\" WHERE " +
		strmangle.WhereClauseRepeated(string(dialect.LQ), string(dialect.RQ), 1, hubPrimaryKeyColumns, len(*o))

	q := queries.Raw(sql, args...)

	err := q.Bind(nil, exec, &slice)
	if err != nil {
		return errors.Wrap(err, "db: unable to reload all in HubSlice")
	}

	*o = slice

	return nil
}

// HubExists checks if the Hub row exists.
func HubExists(exec boil.Executor, iD string) (bool, error) {
	var exists bool
	sql := "select exists(select 1 from \"hubs\" where \"id\"=$1 limit 1)"

	if boil.DebugMode {
		fmt.Fprintln(boil.DebugWriter, sql)
		fmt.Fprintln(boil.DebugWriter, iD)
	}
	row := exec.QueryRow(sql, iD)

	err := row.Scan(&exists)
	if err != nil {
		return false, errors.Wrap(err, "db: unable to check if hubs exists")
	}

	return exists, nil
}
