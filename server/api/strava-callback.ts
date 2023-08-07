import {StravaOauthResponse} from "~/types/StravaOauthResponse";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig().public

    const query = await getQuery(event)
    const authCode = query.code

    console.log("UserId:", query.userId)

    const res: StravaOauthResponse = await $fetch(
        "https://www.strava.com/oauth/token?" + new URLSearchParams({
            client_id: config.stravaClientId,
            client_secret: config.stravaClientSecret,
            code: `${authCode}`,
            grant_type: "authorization_code"
        }),
        {method: "POST"}
    );

    await $fetch(
        "/api/strava-user", {
            method: "POST",
            body: {
                userId: Number(query.userId),
                username: res.athlete.username,
                accessToken: res.access_token,
                refreshToken: res.refresh_token,
                expiresAt: Number(res.expires_at)
            }
        }
    )

    return sendRedirect(event, '/integrations', 302)
})