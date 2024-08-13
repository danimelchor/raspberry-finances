package parsing

import (
	"time"
)

type MMsDDsYYYY struct {
	time.Time
}

func (date *MMsDDsYYYY) UnmarshalCSV(csv string) (err error) {
	date.Time, err = time.Parse("01/02/2006", csv)
	return err
}

type MMsDDsYY struct {
	time.Time
}

func (date *MMsDDsYY) UnmarshalCSV(csv string) (err error) {
	date.Time, err = time.Parse("01/02/06", csv)
	return err
}

type DateTime struct {
	time.Time
}

func (date *DateTime) UnmarshalCSV(csv string) (err error) {
	date.Time, err = time.Parse("2006-01-02 15:04:05", csv)
	return err
}
