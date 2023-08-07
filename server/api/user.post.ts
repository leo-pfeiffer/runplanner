import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const result = await prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            password: body.password // TODO: encrypt
         }
    })
    return {
        result : result
    }
})
