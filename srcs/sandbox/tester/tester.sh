#!/bin/sh  

PLAYER_FILE=$1

TESTER="fonctions_tester.c"

OUTPUT_FILE="test_outputs.txt"

RESULTS_FILE="results.txt"

CTL_FILES_DIR="control_files/"

CFLAGS="-Wall -Wextra -Werror -g"

TEST_FLAG=""

EXO_NAME=""

if [ -z "$PLAYER_FILE" ]; then
	echo "Error, no file to test!"
	exit 1
fi

if [ "$PLAYER_FILE" == "strlen"* ]; then
	TEST_FLAG="-D TEST_STRLEN"
	EXO_NAME="Strlen"
elif [ "$PLAYER_FILE" == "pyramid"* ]; then
	TEST_FLAG="-D TEST_PYRAMID"
	EXO_NAME="Pyramid"
elif [ "$PLAYER_FILE" == "min_range"* ]; then
	TEST_FLAG="-D TEST_RANGE"
	EXO_NAME="Range"
else
	echo "Error, Invalid file!"
	exit 1
fi

cc $CFLAGS $TEST_FLAG $TESTER $PLAYER_FILE

if [ $? -ne 0 ]; then
	echo "Compilation error!" > $RESULTS_FILE
	cc $CFLAGS $TEST_FLAG $TESTER $PLAYER_FILE 2>> $RESULTS_FILE
	exit 1
fi

./a.out > $OUTPUT_FILE

diff $OUTPUT_FILE $CTL_FILES_DIR${EXO_NAME}.txt > $RESULTS_FILE

rm $OUTPUT_FILE ./a.out