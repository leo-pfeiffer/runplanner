import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig().public

    const query = await getQuery(event)

    // check if user even has an associated strava user
    const stravaUser = await prisma.stravaUser.findFirst({
        where: {
            userId: Number(query.userId)
        }
    })

    if (!stravaUser) {
        return {
            result: "No strava user found"
        }
    }

    const res: { access_token: string | null, refresh_token: string | null, expires_at: string | null, } = await $fetch(
        "https://www.strava.com/oauth/token?" + new URLSearchParams({
            client_id: config.stravaClientId,
            client_secret: config.stravaClientSecret,
            grant_type: "refresh_token",
            refresh_token: stravaUser.refreshToken
        }),
        {method: "POST"});


    if (res && res.access_token && res.refresh_token && res.expires_at) {
        console.log(res)
        await $fetch(
            "/api/strava-user", {
                method: "POST",
                body: {
                    userId: Number(query.userId),
                    username: stravaUser.username,
                    accessToken: res.access_token,
                    refreshToken: res.refresh_token,
                    expiresAt: Number(res.expires_at)
                }
            }
        )
        return {
            result: "Token refreshed."
        }
    }

    return {
        result: "Invalid response from Strava API."
    }
})