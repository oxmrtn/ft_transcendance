/*
Assignment name  : pyramid
Expected files   : pyramid.c
Allowed functions: write
-------------------------------------------------------------------------------

Write a function named pyramid that takes an integer 'size' as a parameter and
displays a left-aligned half-pyramid of '*' characters on the standard output.

The 'size' parameter represents the number of rows of the pyramid.

Your function must be declared as follows:

void pyramid(int size);

Examples:

If size is 2, the expected output is:
*
**

If size is 5, the expected output is:
*
**
***
****
*****
*/

#include <unistd.h>

void pyramid(int size)
{
	if (size <= 0)
		return;

	int i = -1, j;

	while (++i < size)
	{
		j = -1;
		while (++j <= i)
			write(1, "*", 1);
		write (1, "\n", 1);
	}
}