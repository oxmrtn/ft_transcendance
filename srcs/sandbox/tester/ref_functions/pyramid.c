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