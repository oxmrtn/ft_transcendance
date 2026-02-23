/*
Assignment name  : min_range
Expected files   : min_range.c
Allowed functions: none
-------------------------------------------------------------------------------

Write a function named min_range that takes an array of integers and its length
as parameters, and returns the minimum absolute difference between any two 
elements in the array.

If the array's length is less than 2, the function must return 0.

Your function must be declared as follows:

unsigned int min_range(int *arr, unsigned int len);

-------------------------------------------------------------------------------
Examples:
If arr is {1, 5, 12, 18, 9} and len is 5, the expected output is 4 
(because the absolute difference between 5 and 9 is 4, which is the minimum).

If arr is {3} and len is 1, the expected output is 0.
*/

unsigned int ft_abs(int a)
{
	return (a > 0? a : -a);
}

unsigned int min_range(int* arr, unsigned int len)
{
	if (len < 2)
		return 0;
	unsigned int i = -1, j;
	unsigned int min = ft_abs(arr[0] - arr[1]);

	while (++i < len)
	{
		j = i;
		while (++j < len)
		{
			if (ft_abs(arr[i] - arr[j]) < min)
				min = ft_abs(arr[i] - arr[j]);
		}
	}
	return (min);
}