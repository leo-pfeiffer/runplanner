<script setup lang="ts">
const config = useRuntimeConfig().public;

const hasStravaUser = ref(false);
const userId = ref(0);
const stravaRefreshToken = ref("")
const stravaAccessToken = ref("")
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

const makeRequest = async () => {
  console.log("makeRequest, token: ", stravaAccessToken.value)
  const response = await fetch("https://www.strava.com/api/v3/athlete", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${stravaAccessToken.value}`
    }
  })
  const data = await response.json()
  console.log(data)
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
      // todo refresh token
      console.log("refresh token")
    }

    stravaAccessToken.value = data.result.stravaUser.accessToken
    stravaRefreshToken.value = data.result.stravaUser.refreshToken
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

// todo make api request
// todo how to store tokens

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
        Refresh Token: {{ stravaRefreshToken }}
        <br>
        Access Token: {{ stravaAccessToken }}
        <br>
        <button @click="makeRequest" class="underline">Make Request</button>
        <br>
        <button @click="refreshStravaToken" class="underline">Refresh Strava Token</button>
        <br>
        <button @click="removeStrava" class="underline">Remove Strava</button>
      </div>
    </div>
  </main>
</template>