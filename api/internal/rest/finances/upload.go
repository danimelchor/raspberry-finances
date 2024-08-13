package finances

import (
	"bytes"
	db "dmelchorpi/internal/model"
	parsing "dmelchorpi/internal/parsing"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

func readAndProcess(username string, fileName string, buf []byte, errors chan error) {
	// Get part data as a string
	value := strings.TrimSpace(string(buf))
	statements, err := parsing.ParseString(fileName, value)
	if err != nil {
		errors <- fmt.Errorf("Failed to parse %s: %s", fileName, err)
		return
	}

	if len(statements) == 0 {
		errors <- fmt.Errorf("No statements found in %s", fileName)
		return
	}

	fmt.Printf("Uploading %d statements from %s\n", len(statements), fileName)
	err = db.InsertStatements(username, statements)
	if err != nil {
		errors <- fmt.Errorf("Failed to insert statements from %s: %s", fileName, err)
		return
	}
	errors <- nil
}

func UploadFiles(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	// open the multipart reader
	mr, err := r.MultipartReader()
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to open multipart reader", http.StatusInternalServerError)
		return
	}

	// buffer to be used for reading bytes from files
	errors := make(chan error)
	count := 0
	for {
		part, err := mr.NextPart()
		if err != nil {
			if err != io.EOF {
				log.Println(err)
				http.Error(w, "Failed to fetch next part", http.StatusInternalServerError)
				return
			}

			// no more parts
			break
		}

		// read into buffer
		var buffer bytes.Buffer
		_, err = io.Copy(&buffer, part)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to read part", http.StatusInternalServerError)
			return
		}
		buf := buffer.Bytes()

		// process the file
		count += 1
		fileName := strings.TrimSpace(strings.ToLower(part.FileName()))
		go readAndProcess(username, fileName, buf, errors)
	}

	for {
		switch err := <-errors; err {
		case nil:
			count -= 1
		default:
			log.Println(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if count == 0 {
			break
		}
	}
	w.WriteHeader(http.StatusOK)
}
