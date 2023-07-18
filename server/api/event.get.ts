import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// todo - add query params so you can get all events for a given user

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body)
    const result = await prisma.event.findUnique({
        where: { id: Number(body.eventId) },
        include: {
            weeks: true
        }
    })
    return {
        result : result
    }
})
