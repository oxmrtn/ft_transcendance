#!/bin/sh  

exo_userID=$1

timeout 10s docker run --rm \
  --network none \
  --memory="128m" \
  --pids-limit 50 \
  -v ./tester/submissions/$exo_userID:/app/$exo_userID.c:ro \
  -v ./tester/results/$exo_userID:/app/results.txt:rw \
  testerdocker
