<script setup lang="ts">
import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();
const config = useRuntimeConfig()

const url = config.stravaOauthUrl + "?" + new URLSearchParams({
  response_type: "code",
  client_id: `${config.stravaClientId}`,
  scope: `${config.stravaScope}`,
  redirect_uri: `${config.stravaCallbackUrl}`
})

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

const stravaAuthCode = ref("")
const stravaRefreshToken = ref("")
const stravaAccessToken = ref("")

onMounted(() => {
  const stravaCode = cookies.get("runplanner-strava-auth-code")
  const refreshToken = cookies.get("runplanner-strava-refresh-token")
  const accessToken = cookies.get("runplanner-strava-access-token")
  if (stravaCode) {
    stravaAuthCode.value = stravaCode
  }
  if (refreshToken) {
    stravaRefreshToken.value = refreshToken
  }
  if (accessToken) {
    stravaAccessToken.value = accessToken
  }
})

// todo make api request
// todo refresh flow
// todo how to store tokens

</script>

<template>
  <Header/>
  <main>
    <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 border-2">
      Auth Code: {{ stravaAuthCode }}
      <br>
      Refresh Token: {{ stravaRefreshToken }}
      <br>
      Access Token: {{ stravaAccessToken }}
      <br>
      <a v-bind:href="url" target="_blank" class="underline">Request access</a>
      <br>
      <button @click="makeRequest">Make Request</button>
    </div>
  </main>
</template>