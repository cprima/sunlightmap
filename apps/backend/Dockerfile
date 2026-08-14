FROM golang:1.22 AS builder
WORKDIR /src
COPY go.mod ./
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/backend .

FROM gcr.io/distroless/static-debian12
WORKDIR /app
COPY --from=builder /out/backend ./backend
COPY world_mine_day_solarized_720-360_compressor.png ./
COPY world_mine_night_solarized_720-360_compressor.png ./
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["./backend"]
