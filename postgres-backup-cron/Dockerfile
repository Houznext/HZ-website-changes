FROM postgres:15-alpine

RUN apk add --no-cache \
    bash \
    aws-cli \
    gzip \
    coreutils

COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Railway cron: run script once and exit (no long-running process).
CMD ["/usr/local/bin/backup.sh"]
