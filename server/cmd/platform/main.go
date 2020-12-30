package main

import (
	"context"
	"errors"
	"fmt"
	gyfhub "gyfhub/server"
	"log"
	"os"

	"gyfhub/server/api"
	"gyfhub/server/seed"

	"github.com/getsentry/sentry-go"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/mailgun/mailgun-go/v3"
	"github.com/ninja-software/terror"
	"github.com/oklog/run"
	"github.com/urfave/cli/v2"
	"github.com/volatiletech/sqlboiler/v4/boil"
)

// Version build Version
const Version = "v0.0.1-dev"
const envPrefix = "GYFHUB"

func main() {
	app := &cli.App{
		Name:    "gyfhub/server",
		Usage:   "test gyfhub",
		Version: Version,
		Commands: []*cli.Command{
			{
				Name:  "serve",
				Usage: "run server",
				Flags: []cli.Flag{
					&cli.StringFlag{Name: "web_root", Value: "/web", Usage: "The absolute path to the web root", EnvVars: []string{envPrefix + "_WEB_ROOT"}},

					&cli.StringFlag{Name: "api_addr", Value: ":8080", Usage: "host server address", EnvVars: []string{envPrefix + "_API_ADDR"}},
					&cli.StringFlag{Name: "api_host", Value: "http://localhost:8080", Usage: "the url for the admin site", EnvVars: []string{envPrefix + "_API_HOST"}},

					&cli.StringFlag{Name: "userauth_jwtsecret", Value: "872ab3df-d7c7-4eb6-a052-4146d0f4dd15", Usage: "JWT secret", EnvVars: []string{envPrefix + "_USERAUTH_JWTSECRET"}},
					&cli.IntFlag{Name: "userauth_tokenexpirydays", Value: 30, Usage: "How many days before the token expires", EnvVars: []string{envPrefix + "_USERAUTH_TOKENEXPIRYDAYS"}},
					&cli.IntFlag{Name: "userauth_resettokenexpirydays", Value: 1, Usage: "How many days before the reset token expires", EnvVars: []string{envPrefix + "_USERAUTH_RESETTOKENEXPIRYDAYS"}},
					&cli.IntFlag{Name: "userauth_blacklistrefreshhours", Value: 1, Usage: "How often should the issued_tokens list be cleared of expired tokens in hours", EnvVars: []string{envPrefix + "_USERAUTH_BLACKLISTREFRESHHOURS"}},

					&cli.StringFlag{Name: "sentry_dsn", Value: "", Usage: "Sends error to remote server. If set, it will send error.", EnvVars: []string{envPrefix + "_SENTRY_DSN"}},
					&cli.StringFlag{Name: "sentry_server_name", Value: "dev-pc", Usage: "The machine name that this program is running on.", EnvVars: []string{envPrefix + "_SENTRY_SERVER_NAME"}},
					&cli.StringFlag{Name: "sentry_environment", Value: "development", Usage: "This program environment.", EnvVars: []string{envPrefix + "_SENTRY_ENVIRONMENT"}},

					&cli.StringFlag{Name: "database_user", Value: "gyfhub/server", Usage: "The database user", EnvVars: []string{envPrefix + "_DATABASE_USER"}},
					&cli.StringFlag{Name: "database_pass", Value: "dev", Usage: "The database pass", EnvVars: []string{envPrefix + "_DATABASE_PASS"}},
					&cli.StringFlag{Name: "database_host", Value: "localhost", Usage: "The database host", EnvVars: []string{envPrefix + "_DATABASE_HOST"}},
					&cli.StringFlag{Name: "database_port", Value: "5438", Usage: "The database port", EnvVars: []string{envPrefix + "_DATABASE_PORT"}},
					&cli.StringFlag{Name: "database_name", Value: "gyfhub/server", Usage: "The database name", EnvVars: []string{envPrefix + "_DATABASE_NAME"}},

					&cli.StringFlag{Name: "email_domain", Value: "njs.dev", Usage: "Mailer domain", EnvVars: []string{envPrefix + "_EMAIL_DOMAIN"}},
					&cli.StringFlag{Name: "email_sender", Value: "Ninja Software <noreply@njs.dev>", Usage: "Default email address to send emails from", EnvVars: []string{envPrefix + "_EMAIL_SENDER"}},
					&cli.StringFlag{Name: "email_apikey", Value: "SAMPLE KEY", Usage: "MailGun API key", EnvVars: []string{envPrefix + "_EMAIL_APIKEY"}},

					&cli.StringFlag{Name: "gify_apikey", Value: "SAMPLE KEY", Usage: "Gify API key", EnvVars: []string{envPrefix + "_GIFY_APIKEY"}},
				},
				Action: func(c *cli.Context) error {
					var err error

					conn := connect(
						c.String("database_user"),
						c.String("database_pass"),
						c.String("database_host"),
						c.String("database_port"),
						c.String("database_name"),
					)

					g := &run.Group{}
					ctx, cancel := context.WithCancel(context.Background())

					g.Add(func() error {
						l := gyfhub.NewLogToStdOut("api", Version, false)

						if len(c.String("sentry_dsn")) > 0 {
							err = sentry.Init(sentry.ClientOptions{
								Dsn:         c.String("sentry_dsn"),
								ServerName:  c.String("sentry_server_name"),
								Release:     Version,
								Environment: c.String("sentry_environment"),
							})
							if err != nil {
								fmt.Printf("Sentry init failed: %v\n", err)
							}
						} else {
							fmt.Println("Sentry init skipped..")
						}

						bl := gyfhub.NewBlacklister(l, conn, c.Int("userauth_blacklistrefreshhours"))

						go bl.StartTicker(ctx)

						mailer := mailgun.NewMailgun(c.String("email_domain"), c.String("email_apikey"))
						mailHost := &api.MailHost{
							Host:   c.String("api_host"),
							Sender: c.String("email_sender"),
						}

						jwtSecret := c.String("userauth_jwtsecret")

						auther := gyfhub.NewAuther(conn, jwtSecret, bl, c.Int("userauth_tokenexpirydays"), c.Int("userauth_resettokenexpirydays"))
						APIController := api.NewAPIController(
							conn,
							l,
							bl,
							jwtSecret,
							auther,
							mailer,
							mailHost,
							c.String("web_root"),
							c.String("gify_apikey"),
						)

						server := &gyfhub.APIService{
							Log:  l,
							Addr: c.String("api_addr"),
						}
						return server.Run(ctx, APIController)
					}, func(err error) {
						fmt.Println(err)
						cancel()
					})

					return g.Run()
				},
			},
			{
				Name:  "db",
				Usage: "run db commands",
				Flags: []cli.Flag{
					&cli.BoolFlag{
						Name:    "seed",
						Value:   false,
						Usage:   "seed the database",
						EnvVars: []string{envPrefix + "_DB_SEED"}},
					&cli.StringFlag{
						EnvVars: []string{envPrefix + "_DATABASE_USER"},
						Name:    "database_user",
						Value:   "gyfhub/server",
						Usage:   "The database user"},
					&cli.StringFlag{
						Name:    "database_pass",
						Value:   "dev",
						EnvVars: []string{envPrefix + "_DATABASE_PASS"},
						Usage:   "The database pass"},
					&cli.StringFlag{
						Name:    "database_host",
						Value:   "localhost",
						EnvVars: []string{envPrefix + "_DATABASE_HOST"},
						Usage:   "The database host"},
					&cli.StringFlag{
						Name:    "database_port",
						Value:   "5438",
						EnvVars: []string{envPrefix + "_DATABASE_PORT"},
						Usage:   "The database port"},
					&cli.StringFlag{
						Name:    "database_name",
						Value:   "gyfhub/server",
						EnvVars: []string{envPrefix + "_DATABASE_NAME"},
						Usage:   "The database name"},
				},
				Action: func(c *cli.Context) error {
					dbSeed := c.Bool("seed")

					databaseUser := c.String("database_user")
					databasePass := c.String("database_pass")
					databaseHost := c.String("database_host")
					databasePort := c.String("database_port")
					databaseName := c.String("database_name")

					if !dbSeed {
						return errors.New("no database seed found")
					}
					conn := connect(
						databaseUser,
						databasePass,
						databaseHost,
						databasePort,
						databaseName,
					)

					if dbSeed {
						err := seed.Run(conn)
						if err != nil {
							terror.Echo(err)
							return err
						}
						fmt.Println("database seeded successfully")
					}
					return nil
				},
			},
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func connect(
	DatabaseUser string,
	DatabasePass string,
	DatabaseHost string,
	DatabasePort string,
	DatabaseName string,

) *sqlx.DB {
	connString := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		"gyfhub", // todo fix this
		DatabasePass,
		DatabaseHost,
		DatabasePort,
		"gyfhub", // todo fix this
	)
	conn, err := sqlx.Connect("postgres", connString)

	if err != nil {
		log.Fatal("could not initialise database:", err)
	}
	if conn == nil {
		panic("conn is nil")
	}

	boil.SetDB(conn)
	return conn
}
