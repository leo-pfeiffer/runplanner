import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    console.log(query)
    const result = await prisma.event.delete({
        where: { id: Number(query.eventId) },
        include: {
            weeks: true
        }
    })
    return {
        result : result
    }
})
