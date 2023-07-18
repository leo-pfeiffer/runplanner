import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body)
    const result = await prisma.event.create({
        data: {
            name: body.name,
            date: new Date(body.date)
        }
    })
    console.log(result)
    return {
        result : result
    }
})
