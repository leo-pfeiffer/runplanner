import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body)

    const result = await prisma.week.create({
        data: {
            eventId: Number(body.eventId),
            weekIndex: Number(body.weekIndex),
            distanceGoal: Number(body.distanceGoal),
            timeGoal: Number(body.timeGoal)
        }
    })
    return {
        result : result
    }
})
