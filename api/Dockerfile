FROM golang:1.22.6-alpine

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . ./

RUN go build -o /api cmd/service/main.go

EXPOSE 8000

CMD [ "/api" ]
