#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#ifdef TEST_STRLEN

int ft_strlen(char*);

int main()
{
	printf("argument: \"\" -> %d", ft_strlen(""));
	printf("\n");
	printf("argument: \"1\" -> %d", ft_strlen("1"));
	printf("\n");
	printf("argument: \"hello world\" -> %d", ft_strlen("hello world"));
	printf("\n");
	printf("argument: \" \\n \\t \\r\" -> %d", ft_strlen(" \n \t \r"));
	printf("\n");
	printf("argument: \"-----------\" -> %d", ft_strlen("----------"));

	return (0);
}
#endif

#ifdef TEST_PYRAMID

void pyramid(int);

int main()
{
	write(1, "argument= 0:\n", 13);
	pyramid(0);
	write(1, "argument= 1:\n", 13);
	pyramid(1);
	write(1, "argument= 4:\n", 13);
	pyramid(4);
	write(1, "argument= 20:\n", 14);
	pyramid(20);
	write(1, "argument= -100:\n", 16);
	pyramid(-100);

	return(0);
}
#endif


#ifdef TEST_RANGE

unsigned int min_range(int*, unsigned int len);

int main()
{
	int arr[] = {0, 1, 2, 3};
	printf("arguments= [0,1,2,3], 4 -> min_range= %u\n", min_range(arr, 4));
	int arr2[] = {21, 26, 3333, 4546546, -1, -23456, 7};
	printf("arguments= [21, 26, 3333, 4546546, -1, -23456, 7], 7 -> min_range= %u\n", min_range(arr2, 7));
	int arr3[] = {10, -10, 100, -100, -10000, 10000};
	printf("arguments= [10, -10, 100, -100, -10000, 10000], 6 -> min_range= %u\n", min_range(arr3, 6));
	int arr4[] = {1, 1, 1, 1, 1, 1, 1, 1, 1};
	printf("arguments= [1, 1, 1, 1, 1, 1, 1, 1, 1], 9 -> min_range= %u\n", min_range(arr4, 9));
	int arr5[] = {7, 77};
	printf("arguments= [7, 77], 2 -> min_range= %u\n", min_range(arr5, 2));
	int arr6[] = {};
	printf("arguments= [], 0 -> min_range= %u\n", min_range(arr6, 0));
	int arr7[] = {4};
	printf("arguments= [4], 1 -> min_range= %u\n", min_range(arr7, 1));

	return 0;
}

#endif