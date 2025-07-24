all: test build example

test: *.go testdata/*.js
	go test -count 1 ./...

build: k6

k6: *.go go.mod go.sum
	xk6 build --with github.com/grafana/xk6-sql@latest --with github.com/dtl-abo/xk6-sql-driver-oracle=.

example: k6
	./k6 run examples/example.js

tidy-deps:
	go mod tidy

.PHONY: test all example tidy-deps
