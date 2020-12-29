package gyfhub

import (
	"context"
	"database/sql"
	"gyfhub/server/db"
	"fmt"
	"sync"
	"time"

	"github.com/volatiletech/sqlboiler/v4/boil"

	"github.com/jmoiron/sqlx"

	"github.com/ninja-software/terror"
	"go.uber.org/zap"
)

// BlacklistProvider methods for token blacklist management
type BlacklistProvider interface {
	OnList(tokenID string) bool
	CleanIssuedTokens() error
	RefreshBlacklist() error
	StartTicker(context.Context)
	BlacklistAll(userID string) error
	BlacklistOne(tokenID string) error
}

// Blacklist type for recording blacklisted tokens
type Blacklist map[string]struct{}

// Blacklister implements BlacklistProvider methods
type Blacklister struct {
	blacklist             Blacklist // blacklisted JWT IDs
	mutex                 sync.Mutex
	log                   *zap.SugaredLogger
	conn                  *sqlx.DB
	blacklistRefreshHours int
}

// NewBlacklister returns a token blacklist provider
func NewBlacklister(log *zap.SugaredLogger, conn *sqlx.DB, blacklistRefreshHours int) *Blacklister {
	blacklist, err := GetBlacklist(conn)
	if err != nil {
		panic(err)
	}
	b := &Blacklister{
		blacklist:             blacklist,
		log:                   log,
		conn:                  conn,
		blacklistRefreshHours: blacklistRefreshHours,
	}
	return b
}

// OnList checks if token id is on the blacklist
func (b *Blacklister) OnList(tokenID string) bool {
	_, found := b.blacklist[tokenID]
	if found {
		return true
	}
	return false
}

// CleanIssuedTokens will delete rows from the issued_tokens list that have passed token expiry and then reload list
// into memory.
func (b *Blacklister) CleanIssuedTokens() error {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	b.log.Info("cleaning blacklist...")

	expiredTokens, err := db.IssuedTokens(db.IssuedTokenWhere.TokenExpires.LT(time.Now())).All(b.conn)
	if err != nil {
		return terror.New(fmt.Errorf("get expired: %w", err), "clean issue tokens")
	}

	for _, token := range expiredTokens {
		_, err := token.Delete(b.conn)
		if err != nil {
			return terror.New(fmt.Errorf("delete expired: %w", err), "clean issue tokens")
		}
	}

	err = b.RefreshBlacklist()
	if err != nil {
		b.log.Error(err)
	}

	return nil
}

// RefreshBlacklist reloads the blacklist into memory
func (b *Blacklister) RefreshBlacklist() error {
	b.log.Info("refreshing blacklist...")

	blacklist, err := GetBlacklist(b.conn)
	if err != nil {
		return terror.New(fmt.Errorf("get blacklist: %w", err), "refresh blacklist")
	}

	b.blacklist = blacklist
	return nil
}

// StartTicker will start the ticker to do issued tokens maintenance to clear expired tokens etc.
func (b *Blacklister) StartTicker(ctx context.Context) {

	dur := time.Duration(b.blacklistRefreshHours) * time.Hour
	ticker := time.NewTicker(dur)
	stop := make(chan bool, 1)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			err := b.CleanIssuedTokens()
			if err != nil {
				b.log.Error(err)
			}
		case <-stop:
			return
		}
	}
}

// BlacklistAll will mark all tokens from that userID as blacklisted. Used when changing password.
func (b *Blacklister) BlacklistAll(userID string) error {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	tokens, err := db.IssuedTokens(db.IssuedTokenWhere.UserID.EQ(userID)).All(b.conn)
	if err != nil {
		return terror.New(fmt.Errorf("get user blacklist: %w", err), "blacklist all")
	}

	for _, token := range tokens {
		token.Blacklisted = true
		_, err = token.Update(b.conn, boil.Whitelist(db.IssuedTokenColumns.Blacklisted))
		if err != nil {
			return terror.New(fmt.Errorf("update token: %w", err), "blacklist all")
		}
	}

	err = b.RefreshBlacklist()
	if err != nil {
		return terror.New(fmt.Errorf("refresh blacklist: %w", err), "blacklist all")
	}

	return nil
}

// BlacklistOne will mark a single token as blacklisted. Could be used to log out a single device
func (b *Blacklister) BlacklistOne(tokenID string) error {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	token, err := db.FindIssuedToken(b.conn, tokenID)
	if err != nil {
		return terror.New(fmt.Errorf("get token: %w", err), "blacklist one")
	}

	token.Blacklisted = true
	_, err = token.Update(b.conn, boil.Whitelist(db.IssuedTokenColumns.Blacklisted))
	if err != nil {
		return terror.New(fmt.Errorf("update token: %w", err), "blacklist one")
	}

	err = b.RefreshBlacklist()
	if err != nil {
		return terror.New(fmt.Errorf("refresh blacklist: %w", err), "blacklist one")
	}

	return nil
}

func GetBlacklist(conn *sqlx.DB) (Blacklist, error) {
	tokens, err := db.IssuedTokens(db.IssuedTokenWhere.Blacklisted.EQ(true)).All(conn)
	if err != nil && err != sql.ErrNoRows {
		return nil, terror.New(err, "get blacklist")
	}
	list := Blacklist{}
	for _, token := range tokens {
		list[token.ID] = struct{}{}
	}
	return list, nil
}
