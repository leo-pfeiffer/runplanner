import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body)
    const result = await prisma.run.create({
        data: {
            distance: Number(body.distance),
            duration: Number(body.duration),
            date: new Date(body.date),
            url: body.url
        }
    })
    console.log(result)
    return {
        result : result
    }
})
