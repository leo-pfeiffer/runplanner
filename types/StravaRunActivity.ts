export interface StravaRunActivity {
    id: number
    distance: number,
    moving_time: number,
    start_date: number,
    type: string
}

export interface StravaRunActivityClean {
    stravaId: number,
    distance: number,
    duration: number,
    date: number,
    source: string
}