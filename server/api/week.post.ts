import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const result = await prisma.week.upsert({
        where: {
            eventId_weekIndex: {
                eventId: Number(body.eventId),
                weekIndex: Number(body.weekIndex)
            }
        },
        update: {
            distanceGoal: Number(body.distanceGoal),
            timeGoal: Number(body.timeGoal)
        },
        create: {
            eventId: Number(body.eventId),
            weekIndex: Number(body.weekIndex),
            distanceGoal: Number(body.distanceGoal),
            timeGoal: Number(body.timeGoal)
        }
    })
    return {
        result: result
    }
})
