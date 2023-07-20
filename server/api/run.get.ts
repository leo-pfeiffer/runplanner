import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    const startDate = query.startDate
    const endDate = query.endDate
    let result;
    if (startDate && endDate) {
        result = await prisma.run.findMany({
            where: {
                date: {
                    gte: new Date(startDate.toString()),
                    lte: new Date(endDate.toString())
                }
            }
        })
    }
    return {
        result : result
    }
})
