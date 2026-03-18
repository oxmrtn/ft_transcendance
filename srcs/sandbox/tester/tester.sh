#!/bin/sh 

PLAYER_FILE=$1

TESTER="fonctions_tester.c"

OUTPUT_FILE="test_outputs.txt"

RESULTS_FILE="results.txt"

CTL_FILES_DIR="control_files/"

CFLAGS="-Wall -Wextra -Werror"

TEST_FLAG=""

EXO_NAME=""

if [ -z "$PLAYER_FILE" ]; then
   echo "Error, no file to test!"
   exit 1
fi

if [ "$PLAYER_FILE" == "strlen"* ]; then
   TEST_FLAG="-D TEST_STRLEN"
   EXO_NAME="Strlen"
   OBJ_FILE="strlen.o"
elif [ "$PLAYER_FILE" == "pyramid"* ]; then
   TEST_FLAG="-D TEST_PYRAMID"
   EXO_NAME="Pyramid"
   OBJ_FILE="pyramid.o"
elif [ "$PLAYER_FILE" == "min_range"* ]; then
   TEST_FLAG="-D TEST_RANGE"
   EXO_NAME="Range"
   OBJ_FILE="range.o"
else
   echo "Error, Invalid file!"
   exit 1
fi

cc -c -o $OBJ_FILE $CFLAGS $PLAYER_FILE

if [ $? -ne 0 ]; then
   echo "Compilation error!" > $RESULTS_FILE
   cc -c $CFLAGS $PLAYER_FILE 2>> $RESULTS_FILE
   exit 1
fi

if [ "$EXO_NAME" == "Pyramid" ]; then
   EXT_FUNC=$(nm -gu "$OBJ_FILE" | grep -v "w __gmon_start__" | grep -v "U __libc_start_main" | grep -v "write")
else
   EXT_FUNC=$(nm -gu "$OBJ_FILE" | grep -v "w __gmon_start__" | grep -v "U __libc_start_main")
fi

if [ -n "$EXT_FUNC" ]; then
   rm -rf "$OUTPUT_FILE" "$OBJ_FILE"
   echo "Forbidden function:" > $RESULTS_FILE
   echo "$EXT_FUNC" >> $RESULTS_FILE
   exit 1
fi

cc $TEST_FLAG $TESTER $OBJ_FILE

timeout 3s ./a.out > $OUTPUT_FILE
EXIT_STATUS=$?

if [ $EXIT_STATUS -eq 124 ]; then
   rm -rf $OUTPUT_FILE $OBJ_FILE ./a.out
   echo "Execution took to long, look for infinite loop ? " > $RESULTS_FILE
   exit 1
fi

diff $OUTPUT_FILE $CTL_FILES_DIR${EXO_NAME}.txt > $RESULTS_FILE

rm $OUTPUT_FILE $OBJ_FILE ./a.out

if [ -s "$RESULTS_FILE" ]; then
   exit 1
fi

exit 0