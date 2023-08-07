import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    const email = query.email
    let user;
    if (email) {
        user = await prisma.user.findUnique({
            where: {
                email: email.toString()
            },
            include: {
                stravaUser: true
            }
        })
    }
    if (user) {
        return {
            result : {
                id: user.id,
                name: user.name,
                email: user.email,
                stravaUser: !!user.stravaUser
            }
        }
    }
    return {
        result : null
    }
})
