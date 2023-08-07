<script setup lang="ts">
import {ApiResult} from "~/types/ApiResult";
import {RunInDb} from "~/types/RunInDb";
import {Ref} from "vue";

const config = useRuntimeConfig().public;

const hasStravaUser = ref(false);
const userId = ref(0);
const theUrl = ref("");
const allRuns: Ref<RunInDb[]> = ref([]);

const updateUrl = () => {
  theUrl.value = config.stravaOauthUrl + "?" + new URLSearchParams({
    response_type: "code",
    client_id: `${config.stravaClientId}`,
    scope: `${config.stravaScope}`,
    redirect_uri: `${config.stravaCallbackUrl}?userId=${userId.value}`,
  })
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
  hasStravaUser.value = !!data.result.stravaUser;
}

const getRuns = async (): Promise<ApiResult<RunInDb[]>> => {
  return await $fetch("/api/run")
}

const updateRuns = async () => {
  allRuns.value = (await getRuns()).result
}

onMounted(async () => {
  await getUser()
  updateUrl()
  await updateRuns()
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
        <button @click="removeStrava" class="underline">Remove Strava</button>
      </div>
      <div class="bg-white rounded px-8 pt-6 pb-8 mb-4">
        <button @click="listActivities" class="underline">Sync Activities</button>
        <table class="table-auto w-full border-collapse border">
          <thead class="bg-slate-100">
          <tr class="border">
            <th class="px-2.5 py-1">Source</th>
            <th class="px-2.5 py-1">Date</th>
            <th class="px-2.5 py-1">Distance</th>
            <th class="px-2.5 py-1">Duration</th>
          </tr>
          </thead>
          <tbody>
          <tr class="border" v-for="run in allRuns">
            <td class="px-2.5 py-1">{{ run.source }}</td>
            <td class="px-2.5 py-1">{{ formatDateAndTime(run.date) }}</td>
            <td class="px-2.5 py-1">{{ run.distance }}</td>
            <td class="px-2.5 py-1">{{ run.duration }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>