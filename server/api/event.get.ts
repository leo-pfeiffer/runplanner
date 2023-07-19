import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    console.log(query)
    let result;
    // return event by ID
    if (query.eventId) {
        result = await prisma.event.findUnique({
            where: { id: Number(query.eventId) },
            include: {
                weeks: true
            }
        })
    }
    // return all events
    else {
        result = await prisma.event.findMany({
            include: {
                weeks: false
            }
        })
    }
    return {
        result : result
    }
})
