import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    const email = query.email
    let result;
    if (email) {
        result = await prisma.user.findUnique({
            where: {
                email: email.toString()
            },
            include: {
                stravaUser: true
            }
        })
    }
    if (result) {
        // @ts-ignore todo
        result.password = undefined
        if (result.stravaUser) {
            // @ts-ignore todo
            result.stravaUser = true;
        }
    }
    return {
        result : result
    }
})
