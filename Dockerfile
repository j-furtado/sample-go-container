
FROM azcontregxpto.azurecr.io/golang:latest

# Create app directory
RUN mkdir -p /usr/src/app

COPY app/* /usr/src/app

WORKDIR /usr/src/app

RUN go build -o main .

EXPOSE 80

# set a health check
HEALTHCHECK --interval=5s \
            --timeout=5s \
            CMD curl -f http://127.0.0.1:80 || exit 1

CMD ["main"]
