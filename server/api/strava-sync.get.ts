import {PrismaClient} from "@prisma/client";
import {timeToExpiration} from "~/utils/tokenutils";
import {StravaRunActivity, StravaRunActivityClean} from "~/types/StravaRunActivity";
const prisma = new PrismaClient()

const refreshTokenIfExpired = async (userId: number, expiresAt: number) => {
    const expiresIn = timeToExpiration(expiresAt)
    if (expiresIn < 1800) {
        console.log("Refreshing token. Old token expires in:", expiresIn)
        await $fetch("/api/strava-refresh?" + new URLSearchParams({userId: `${userId}`}), {
            method: "POST"
        })
    }
}

const fetchPage = (page: number, accessToken: String): Promise<StravaRunActivity[]> => {
    // @ts-ignore - TS doesn't like this, todo fix
    return $fetch("https://www.strava.com/api/v3/activities?" + new URLSearchParams({
        page: `${page}`,
        after: "1688718866", // todo as parameter
        per_page: "30"
    }), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });
}

const filterActivities = (activities: StravaRunActivity[]): StravaRunActivityClean[] => {
    return activities
        .filter((activity) => activity.type === "Run")
        .map((activity) => {
            return {
                stravaId: activity.id,
                distance: activity.distance,
                duration: activity.moving_time,
                date: activity.start_date,
                source: "Strava"
            }
        })
}

const createStravaRun = (stravaId: number, distance: number, duration: number, date: number, source: string) => {
    return prisma.stravaRun.upsert({
        where: {
            stravaId: stravaId
        },
        update: {},
        create: {
            stravaId: stravaId,
            run: {
                create: {
                    distance: distance,
                    duration: duration,
                    date: new Date(date),
                    source: source
                }
            }
        }
    });
}

export default defineEventHandler(async (event) => {
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

    await refreshTokenIfExpired(Number(query.userId), Number(stravaUser.expiresAt))

    let currPage = 1;
    let activities: StravaRunActivity[] = [];
    while (true) {
        const res = await fetchPage(currPage++, stravaUser.accessToken)
        if (res && res.length > 0) {
            activities = activities.concat(res)
        } else {
            break;
        }
    }

    const filteredActivities = filterActivities(activities)

    for (const activity of filteredActivities) {
        await createStravaRun(activity.stravaId, activity.distance, activity.duration, activity.date, activity.source)
    }

    return {
        result: filteredActivities
    }
})