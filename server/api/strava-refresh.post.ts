import {PrismaClient} from "@prisma/client";
import {StravaOauthResponse} from "~/types/StravaOauthResponse";
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

    // @ts-ignore - don't understand why TS is complaining about this, todo fix
    const res: StravaOauthResponse = await $fetch(
        "https://www.strava.com/oauth/token?" + new URLSearchParams({
            client_id: config.stravaClientId,
            client_secret: config.stravaClientSecret,
            grant_type: "refresh_token",
            refresh_token: stravaUser.refreshToken
        }),
        {
            method: "POST"
        });

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
})