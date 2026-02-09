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