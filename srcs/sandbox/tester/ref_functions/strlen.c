/*
Assignment name  : ft_strlen
Expected files   : ft_strlen.c
Allowed functions: none
-------------------------------------------------------------------------------

Write a function named ft_strlen that takes a string as a parameter and returns
its length.

The length of a string is the number of characters that precede the terminating
NUL character.

Your function must be declared as follows:

int ft_strlen(char *str);
*/

int ft_strlen(char* str)
{
	char *start = str;

	while (*str)
		++str;
	return (str - start);
}