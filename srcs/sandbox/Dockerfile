FROM alpine@sha256:59855d3dceb3ae53991193bd03301e082b2a7faa56a514b03527ae0ec2ce3a95

RUN apk add build-base coreutils

WORKDIR /app

COPY ./tester/control_files ./control_files
COPY ./tester/fonctions_tester.c ./fonctions_tester.c
COPY ./tester/tester.sh ./tester.sh

CMD ["sh", "-c", "./tester.sh $(ls *.c | grep -v fonctions_tester.c)"]
