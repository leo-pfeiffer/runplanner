export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const query = await getQuery(event)
    const authCode = query.code

    setCookie(event, "runplanner-strava-auth-code", `${authCode}`)

    const res: {access_token: string | null, refresh_token: string | null} = await $fetch(
        "https://www.strava.com/oauth/token?" + new URLSearchParams({
            client_id: config.stravaClientId,
            client_secret: config.stravaClientSecret,
            code: `${authCode}`,
            grant_type: "authorization_code"
        }),
        {method: "POST"}
    );

    console.log(res)

    if (res && res.access_token && res.refresh_token) {
        setCookie(event, "runplanner-strava-access-token", `${res.access_token}`)
        setCookie(event, "runplanner-strava-refresh-token", `${res.refresh_token}`)
    }

    return sendRedirect(event, '/integrations', 302)
})