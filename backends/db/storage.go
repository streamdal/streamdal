package db

import (
	"database/sql"
	"fmt"
	"net/url"

	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

type IDB interface {
	Get(dest interface{}, query string, args ...interface{}) error
	MustBegin() *sqlx.Tx
	NamedQuery(query string, arg interface{}) (*sqlx.Rows, error)
	Query(query string, args ...interface{}) (*sql.Rows, error)
	Queryx(query string, args ...interface{}) (*sqlx.Rows, error)
	QueryRowx(query string, args ...interface{}) *sqlx.Row
	Select(dest interface{}, query string) error
}

type Storage struct {
	DB      *sqlx.DB
	options *Options
	log     *logrus.Entry
}

// TODO: configure TLS
type Options struct {
	Host          string
	Name          string
	User          string
	Pass          string
	Port          int
	RunMigrations bool
	MigrationsDir string
	EnableTLS     bool
}

func New(opts *Options) (*Storage, error) {
	if err := validateOptions(opts); err != nil {
		return nil, errors.Wrap(err, "Unable to complete option validation")
	}

	u := url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(opts.User, opts.Pass),
		Host:   opts.Host + ":" + fmt.Sprintf("%d", opts.Port),
		Path:   "/" + opts.Name,
	}

	if !opts.EnableTLS {
		q := u.Query()
		q.Add("sslmode", "disable")
		u.RawQuery = q.Encode()
	}

	connInfo := u.String()

	db, err := sqlx.Connect("pgx", connInfo)

	if err != nil {
		return nil, errors.Wrap(err, "unable to connect to DB with pgx driver")
	}

	if err := db.Ping(); err != nil {
		return nil, errors.Wrap(err, "unable to perform initial DB ping")
	}

	logrus.Info("Pinged database successfully")

	return &Storage{
		DB:      db,
		options: opts,
		log:     logrus.WithField("pkg", "postgres"),
	}, nil
}

func validateOptions(opts *Options) error {
	if opts.Host == "" {
		return errors.New("Host cannot be empty")
	}

	if opts.Name == "" {
		return errors.New("Name cannot be empty")
	}

	if opts.Port == 0 {
		return errors.New("Port cannot be unset")
	}

	return nil
}

func (s *Storage) Get(dest interface{}, query string, args ...interface{}) error {
	return s.DB.Get(dest, query, args...)
}

func (s *Storage) NamedQuery(query string, arg interface{}) (*sqlx.Rows, error) {
	return s.DB.NamedQuery(query, arg)
}

func (s *Storage) Query(query string, args ...interface{}) (*sql.Rows, error) {
	return s.DB.Query(query, args...)
}

func (s *Storage) Queryx(query string, args ...interface{}) (*sqlx.Rows, error) {
	return s.DB.Queryx(query, args...)
}

func (s *Storage) QueryRowx(query string, args ...interface{}) *sqlx.Row {
	return s.DB.QueryRowx(query, args...)
}

func (s *Storage) Select(dest interface{}, query string) error {
	return s.DB.Select(dest, query)
}

func (s *Storage) MustBegin() *sqlx.Tx {
	return s.DB.MustBegin()
}
