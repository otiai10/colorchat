FROM golang:1.9
LABEL maintainer="otiai10"

ADD . ${GOPATH}/src/github.com/otiai10/colorchat
RUN go get ./...
# RUN go get github.com/otiai10/colorchat

CMD colorchat
