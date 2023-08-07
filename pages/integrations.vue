<script setup lang="ts">
const config = useRuntimeConfig().public;

const hasStravaUser = ref(false);
const userId = ref(0);
const theUrl = ref("");

const updateUrl = () => {
  const url = config.stravaOauthUrl + "?" + new URLSearchParams({
    response_type: "code",
    client_id: `${config.stravaClientId}`,
    scope: `${config.stravaScope}`,
    redirect_uri: `${config.stravaCallbackUrl}?userId=${userId.value}`,
  })
  console.log(url)
  theUrl.value = url
}

const refreshStravaToken = async () => {
  console.log("refreshStravaToken")
  const response = await fetch("/api/strava-refresh?" + new URLSearchParams({userId: `${userId.value}`}), {
    method: "POST"
  })
  const data = await response.json()
  console.log(data)
}

const removeStrava = async () => {
  console.log("removeStrava")
  const response = await fetch("/api/strava-user?" + new URLSearchParams({userId: `${userId.value}`}), {
    method: "DELETE"
  })
  const data = await response.json()
  console.log(data)
  hasStravaUser.value = false
}

const listActivities = async () => {
  console.log("listActivities")
  const response = await fetch("/api/strava-sync?" + new URLSearchParams({userId: `${userId.value}`}))
  const data = await response.json()
  console.log(data)
}

const getUser = async () => {
  const response = await fetch("/api/user?" + new URLSearchParams({
    email: "leopold.pfeiffer@icloud.com"
  }))
  const data = await response.json()
  userId.value = data.result.id

  if (data.result.stravaUser) {
    hasStravaUser.value = true
    // check if token expires in next 60 minutes
    const timeIn30Minutes = Number(new Date()) / 1000 + 3600
    const expiresAt = Number(data.result.stravaUser.expires_at)
    if (expiresAt < timeIn30Minutes) {
      const response = await fetch("/api/strava-refresh?" + new URLSearchParams({userId: `${userId.value}`}), {
        method: "POST"
      })
      console.log(response.json())
    }
  } else {
    hasStravaUser.value = false
  }
  console.log(data)
  console.log(userId.value)
}

onMounted(async () => {
  await getUser()
  updateUrl()
})

</script>

<template>
  <Header/>
  <main>
    <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 border-2">
      <div v-if="!hasStravaUser">
        You have not enabled Strava yet.
        <a v-bind:href="theUrl" target="_blank" class="underline">Enable now?</a>
      </div>
      <div v-else>
        Congrats, you have enabled Strava.
        <br>
        <button @click="refreshStravaToken" class="underline">Refresh Strava Token</button>
        <br>
        <button @click="removeStrava" class="underline">Remove Strava</button>
      </div>
      <div class="bg-white rounded px-8 pt-6 pb-8 mb-4">
        <button @click="listActivities" class="underline">Sync Activities</button>
      </div>
    </div>
  </main>
</template>