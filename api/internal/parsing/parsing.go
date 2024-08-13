package parsing

import (
	db "dmelchorpi/internal/model"
	"log"
	"os"
	"strings"

	"github.com/gocarina/gocsv"
)

type CsvStatement interface {
	ToStatementRow() db.StatementRow
}

func ParseFile(file *os.File) ([]db.StatementRow, error) {
	fileName := file.Name()
	content, err := os.ReadFile(fileName)
	if err != nil {
		return nil, err
	}
	return ParseString(fileName, string(content))
}

func ParseStatement[T CsvStatement](contents string, arr []T) ([]db.StatementRow, error) {
	statements := []db.StatementRow{}
	if err := gocsv.UnmarshalString(contents, &arr); err != nil {
		return nil, err
	}
	for _, s := range arr {
		statements = append(statements, s.ToStatementRow())
	}
	return statements, nil
}

func ParseString(fileName string, contents string) ([]db.StatementRow, error) {
	var statementRows []db.StatementRow
	var err error
	switch {
	case strings.Contains(fileName, "amex"):
		statementRows, err = ParseStatement(contents, []AmexStatementRow{})
	case strings.Contains(fileName, "apple"):
		statementRows, err = ParseStatement(contents, []AppleStatementRow{})
	case strings.Contains(fileName, "capitalone"):
		statementRows, err = ParseStatement(contents, []CapitalOneStatementRow{})
	case strings.Contains(fileName, "chase"):
		statementRows, err = ParseStatement(contents, []ChaseStatementRow{})
	case strings.Contains(fileName, "discover"):
		statementRows, err = ParseStatement(contents, []DiscoverStatementRow{})
	case strings.Contains(fileName, "wise"):
		statementRows, err = ParseStatement(contents, []WiseStatementRow{})
	}

	if err != nil {
		return nil, err
	}
	log.Printf("Parsed %d statements from %s", len(statementRows), fileName)
	return statementRows, nil
}
