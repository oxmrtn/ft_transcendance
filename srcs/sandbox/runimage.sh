#!/bin/sh  

exo_userID=$1

docker run --rm -v ./tester/submissions/$exo_userID:/app/$exo_userID.c -v ./tester/results/$exo_userID:/app/results.txt testerdocker