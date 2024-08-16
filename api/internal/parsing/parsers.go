package parsing

import (
	db "dmelchorpi/internal/model"
	"math"
)

type AmexStatementRow struct {
	Date     MMsDDsYYYY `csv:"Date"`
	Merchant string     `csv:"Description"`
	Amount   float32    `csv:"Amount"`
	Category string     `csv:"Category"`
}

func (am AmexStatementRow) ToStatementRow() db.StatementRow {
	return db.StatementRow{
		Date:     am.Date.Time,
		Merchant: am.Merchant,
		Amount:   am.Amount * -1,
		Category: am.Category,
		Source:   "amex",
	}
}

type AppleStatementRow struct {
	Date     MMsDDsYYYY `csv:"Transaction Date"`
	Merchant string     `csv:"Merchant"`
	Amount   float32    `csv:"Amount (USD)"`
	Category string     `csv:"Category"`
}

func (am AppleStatementRow) ToStatementRow() db.StatementRow {
	return db.StatementRow{
		Date:     am.Date.Time,
		Merchant: am.Merchant,
		Amount:   am.Amount * -1,
		Category: am.Category,
		Source:   "apple",
	}
}

type CapitalOneStatementRow struct {
	Date            MMsDDsYY `csv:"Transaction Date"`
	Merchant        string   `csv:"Transaction Description"`
	Amount          float64  `csv:"Transaction Amount"`
	TransactionType string   `csv:"Transaction Type"`
}

func (am CapitalOneStatementRow) ToStatementRow() db.StatementRow {
	var amount float64
	if am.TransactionType == "Debit" {
		amount = math.Abs(am.Amount) * -1
	} else {
		amount = math.Abs(am.Amount)
	}

	return db.StatementRow{
		Date:     am.Date.Time,
		Merchant: am.Merchant,
		Amount:   float32(amount),
		Category: "",
		Source:   "capitalone",
	}
}

type ChaseStatementRow struct {
	Date     MMsDDsYYYY `csv:"Transaction Date"`
	Merchant string     `csv:"Description"`
	Amount   float32    `csv:"Amount"`
	Category string     `csv:"Category"`
}

func (am ChaseStatementRow) ToStatementRow() db.StatementRow {
	return db.StatementRow{
		Date:     am.Date.Time,
		Merchant: am.Merchant,
		Amount:   am.Amount,
		Category: am.Category,
		Source:   "chase",
	}
}

type DiscoverStatementRow struct {
	Date     MMsDDsYYYY `csv:"Trans. Date"`
	Merchant string     `csv:"Description"`
	Amount   float32    `csv:"Amount"`
	Category string     `csv:"Category"`
}

func (am DiscoverStatementRow) ToStatementRow() db.StatementRow {
	return db.StatementRow{
		Date:     am.Date.Time,
		Merchant: am.Merchant,
		Amount:   am.Amount * -1,
		Category: am.Category,
		Source:   "discover",
	}
}

type WiseStatementRow struct {
	Date       DateTime `csv:"Created on"`
	TargetName string   `csv:"Target name"`
	SourceName string   `csv:"Source name"`
	Amount     float32  `csv:"Source amount (after fees)"`
	Direction  string   `csv:"Direction"`
}

func (am WiseStatementRow) ToStatementRow() db.StatementRow {
	var merchant string
	var amount float32
	if am.Direction == "OUT" {
		amount = am.Amount * -1
		merchant = am.TargetName
	} else {
		amount = am.Amount
		merchant = am.SourceName
	}
	return db.StatementRow{
		Date:     am.Date.Time,
		Merchant: merchant,
		Amount:   amount,
		Category: "",
		Source:   "wise",
	}
}
