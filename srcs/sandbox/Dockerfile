FROM alpine

RUN apk add build-base

WORKDIR /app

COPY ./tester/control_files ./control_files
COPY ./tester/fonctions_tester.c ./fonctions_tester.c
COPY ./tester/tester.sh ./tester.sh

CMD ["sh", "-c", "./tester.sh $(ls *.c | grep -v fonctions_tester.c)"]
