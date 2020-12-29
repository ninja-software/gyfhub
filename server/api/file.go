package api

import (
	"bytes"
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/gofrs/uuid"
	"github.com/h2non/filetype"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/sqlboiler/v4/boil"
)

// FileController adds file uploads and download routes
type FileController struct {
	Conn   *sqlx.DB
	Auther *gyfhub.Auther
}

// FileRouter holds file routes
func FileRouter(conn *sqlx.DB, jwtSecret string, auther *gyfhub.Auther) chi.Router {

	c := &FileController{
		conn,
		auther,
	}
	r := chi.NewRouter()
	r.Get("/{id}", WithError(WithMember(conn, jwtSecret, c.Attachment)))
	r.Post("/upload", WithError(WithMember(conn, jwtSecret, c.Upload)))

	return r
}

// Attachment provides a url handler to allow users to download blobs
func (c FileController) Attachment(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	id, err := uuid.FromString(chi.URLParam(r, "id"))
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "")
	}

	att, err := db.FindBlob(c.Conn, id.String())
	if err != nil {
		http.Error(w, "could not get file", http.StatusBadRequest)
		return http.StatusBadRequest, terror.New(err, "encode json")
	}

	// tell the browser the returned content should be downloaded/inline
	if att.MimeType != "" && att.MimeType != "unknown" {
		w.Header().Add("Content-Type", att.MimeType)
	}
	w.Header().Add("Content-Disposition", fmt.Sprintf("%s;filename=%s", "attachment", att.FileName))
	rdr := bytes.NewReader(att.File)
	http.ServeContent(w, r, att.FileName, time.Now(), rdr)

	return http.StatusOK, nil
}

// Upload files and return blob id
func (c FileController) Upload(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	file, header, err := r.FormFile("file")
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "")
	}

	defer file.Close()

	data, err := ioutil.ReadAll(file)
	if err != nil {
		return http.StatusInternalServerError, terror.New(terror.ErrParse, "parse error")
	}

	// get mime type
	kind, err := filetype.Match(data)
	if err != nil {
		return http.StatusInternalServerError, terror.New(terror.ErrParse, "parse error")
	}

	if kind == filetype.Unknown {
		return http.StatusInternalServerError, terror.New(fmt.Errorf("file type is unknown"), "")
	}

	mimeType := kind.MIME.Value
	extension := kind.Extension

	b := &db.Blob{
		FileName:      header.Filename,
		MimeType:      mimeType,
		Extension:     extension,
		FileSizeBytes: header.Size,
		File:          data,
	}

	err = b.Insert(c.Conn, boil.Infer())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "fail to insert")
	}

	return helpers.EncodeJSON(w, b.ID)
}
