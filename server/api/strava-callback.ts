export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig().public

    const query = await getQuery(event)
    const authCode = query.code

    console.log("UserId:", query.userId)

    const res: {
        access_token: string | null,
        refresh_token: string | null,
        expires_at: string | null,
        athlete: {username: string | null}
    } = await $fetch(
        "https://www.strava.com/oauth/token?" + new URLSearchParams({
            client_id: config.stravaClientId,
            client_secret: config.stravaClientSecret,
            code: `${authCode}`,
            grant_type: "authorization_code"
        }),
        {method: "POST"}
    );

    console.log(res)

    if (res && res.access_token && res.refresh_token && res.expires_at && res.athlete.username) {
        const stravaUser = await $fetch(
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

        console.log(stravaUser)
    }

    return sendRedirect(event, '/integrations', 302)
})