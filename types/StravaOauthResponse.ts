export interface StravaOauthResponse {
    access_token: string,
    refresh_token: string,
    expires_at: string,
    athlete: {
        username: string
    }
}