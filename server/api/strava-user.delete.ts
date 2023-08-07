import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    const result = await prisma.stravaUser.delete(
        {
            where: { userId: Number(query.userId) },
        })
    console.log(result)
    return {
        result : result
    }
})
