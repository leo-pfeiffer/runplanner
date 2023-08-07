import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    const startDate = query.startDate ? new Date(query.startDate.toString()) : new Date(2000, 1, 1)
    const endDate = query.endDate ? new Date(query.endDate.toString()) : new Date()
    const result = await prisma.run.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            date: 'desc'
        }
    })
    return {
        result : result
    }
})
