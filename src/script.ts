import { prisma } from './lib/prisma'

async function main() {
  // Example: Fetch all records from a table
  // Replace 'user' with your actual model name
  const allUsers = await prisma.user.findMany()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })