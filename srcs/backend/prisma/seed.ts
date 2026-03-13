import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

const CHALLENGES = [
  {
    title: "strlen",
    subject: `Assignment name  : ft_strlen
Allowed functions: none
-------------------------------------------------------------------------------

Write a function named ft_strlen that takes a string as a parameter and returns
its length.

The length of a string is the number of characters that precede the terminating
NUL character.

Your function must be declared as follows:

int ft_strlen(char *str);`
  },
  {
    title: "pyramid",
    subject: `Assignment name  : pyramid
Allowed functions: write
-------------------------------------------------------------------------------

Write a function named pyramid that takes an integer 'size' as a parameter and
displays a left-aligned half-pyramid of '*' characters on the standard output.
The 'size' parameter represents the number of rows of the pyramid.

Your function must be declared as follows:

void pyramid(int size);
-------------------------------------------------------------------------------

Examples:
If size is 2, the expected output is:
*
**
If size is 5, the expected output is:
*
**
***
****
*****`
  },
  {
    title: "min_range",
    subject: `Assignment name  : min_range
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

If arr is {3} and len is 1, the expected output is 0.`
  }
]

async function main() {
  await prisma.$transaction(
    CHALLENGES.map((challenge) =>
      prisma.exercise.upsert({
        where: { title: challenge.title },
        update: {
          subject: challenge.subject,
        },
        create: challenge,
      })
    )
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())