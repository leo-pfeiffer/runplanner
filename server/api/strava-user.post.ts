import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const result = await prisma.stravaUser.upsert({
        where: {
            userId: Number(body.userId)
        },
        update: {
            accessToken: body.accessToken,
            refreshToken: body.refreshToken,
            expiresAt: Number(body.expiresAt)
        },
        create: {
            userId: body.userId,
            username: body.username,
            accessToken: body.accessToken,
            refreshToken: body.refreshToken,
            expiresAt: Number(body.expiresAt)
        }
    })
    return {
        result : result
    }
})
