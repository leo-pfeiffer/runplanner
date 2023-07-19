import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// todo - add query params for filtering
//   should be able to filter by date range, distance range, duration range
//   not just get by ID

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    let result = await prisma.event.findMany()
    return {
        result : result
    }
})
