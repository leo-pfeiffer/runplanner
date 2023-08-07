export const timeToExpiration = (expiresAt: number): number => {
    return expiresAt - Date.now() / 1000
}
