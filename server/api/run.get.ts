import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// todo - add query params for filtering
//   should be able to filter by date range, distance range, duration range
//   not just get by ID

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body)
    const result = await prisma.run.findUnique({
        where: { id: Number(body.eventId) }
    })
    return {
        result : result
    }
})
