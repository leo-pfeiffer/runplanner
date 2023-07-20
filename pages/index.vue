<script setup lang="ts">

import {Event} from "~/types/Event";
import {Week} from "~/types/Week";
import {ApiResult} from "~/types/ApiResult";
import {Ref} from "vue";
import {Run} from "~/types/Run";

const event: Ref<Event | undefined> = ref();

const events: Ref<Event[]> = ref([])

const newRun = ref({
  distance: null,
  hours: null,
  minutes: null,
  seconds: null,
  startTime: null,
});

const displayDiv: Ref<boolean[]> = ref([]);

const selected = ref("")

const weeks = computed(() => {
  if (event.value) {
    return event.value.weeks.sort((a: Week, b: Week) => a.weekIndex - b.weekIndex)
  }
  return []
})

const getEvent = async (eventId: number): Promise<ApiResult<Event>> => {
  return await $fetch(`/api/event?eventId=${eventId}`)
}

const getEvents = async (): Promise<ApiResult<Event[]>> => {
  return await $fetch('/api/event')
}

const getRunsBetweenDates = async (startDate: Date, endDate: Date): Promise<ApiResult<Run[]>> => {
  return await $fetch(`/api/run?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
}

const toggleDiv = (idx: number) => {
  displayDiv.value[idx] = !displayDiv.value[idx];
}

const subtractWeeks = (date: Date | string, weeks: number): Date => {
  date = new Date(date);
  date.setDate(date.getDate() - 7 * weeks);
  return date;
}

const selectEvent = async () => {
  const receivedEvent = await getEvent(Number(selected.value));
  if (!receivedEvent || !receivedEvent.result) {
    return;
  }
  event.value = receivedEvent.result;
  displayDiv.value = new Array(event.value.weeks.length).fill(false);
  const endDate = new Date(receivedEvent.result.date);
  const startDate = subtractWeeks(endDate, receivedEvent.result.weeks.length)
  await getRunsBetweenDates(startDate, endDate).then(console.log)
}

const createRun = () => {
  // todo validate input
  console.log(newRun.value);
  $fetch(
    '/api/run',
    {
      method: 'POST',
      body: {
        distance: newRun.value.distance,
        duration: Number(newRun.value.hours) * 3600 + Number(newRun.value.minutes) * 60 + Number(newRun.value.seconds),
        date: newRun.value.startTime,
        source: 'manual',
      }
    }
  )
}

onMounted(async () => {
  const allEvents = await getEvents();
  if (allEvents && allEvents.result) {
    events.value = allEvents.result;
  }
})


</script>

<template>
  <Header/>
  <main>
    <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 border-2">
      <div class="text-center py-5 my-2 bg-red-300">
        <div v-if="event">
          <p class="text-2xl font-bold leading-6 text-gray-900">{{ event.name }}</p>
          <p class="mt-1 truncate text-sm leading-5 text-gray-500">{{ event.date }}</p>
        </div>
        <select v-model="selected" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" @change="selectEvent">
          <option disabled value="">Please select an event</option>
          <option v-for="e in events" :value="e.id" :key="e.id">{{ e.name }}</option>
        </select>
      </div>
      <div>
        <table class="table-auto w-full border-collapse border" v-if="selected">
          <thead class="bg-slate-100">
            <tr class="border">
              <th class="px-4 py-2"></th>
              <th class="px-4 py-2">Date</th>
              <th class="px-4 py-2">Distance</th>
              <th class="px-4 py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr class="text-sm text-center bg-slate-100">
              <td class="px-4 py-2">
                <button class="text-md font-semibold py-2 px-2 border-2 rounded-md bg-slate-50 hover:border-red-300" @click="createRun">
                  Add new run
                </button>
              </td>
              <td class="py-2">
                <input type="datetime-local" v-model="newRun.startTime" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Start time">
              </td>
              <td class="py-2">
                <input type="number" v-model="newRun.distance" step="0.01" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Distance (mi)">
              </td>
              <td class="py-2">
                <input type="number" v-model="newRun.hours" class="max-w-[4rem] border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Hrs">
                <input type="number" v-model="newRun.minutes" class="border max-w-[4rem] rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Min">
                <input type="number" v-model="newRun.seconds" class="border max-w-[4rem] rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Sec">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul role="list">
        <li v-for="(week, idx) in weeks" class="gap-4 gap-x-6">
          <div class="grid grid-cols-4 py-5 my-2 bg-slate-200">
            <div class="gap-x-4">
              <div class="text-center min-w-0 flex-auto">
                <div class="text-2xl font-bold text-center text-gray-900">
                  <button class="py-2 px-2" @click="() => toggleDiv(idx)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-chevron-down" viewBox="0 0 16 16">
                      <path v-if="displayDiv[idx]" fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                      <path v-else fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                  Week {{ week.weekIndex }}
                </div>
              </div>
            </div>
            <div class="gap-x-4">
              <div class="min-w-0 flex-auto">
                <p class="text-md font-semibold leading-6 text-gray-900">Distance</p>
                <p class="mt-1 truncate text-sm leading-5 text-gray-500">12 mi / 10 mi</p>
              </div>
            </div>
            <div class="gap-x-4">
              <div class="min-w-0 flex-auto">
                <p class="text-md font-semibold leading-6 text-gray-900">Duration</p>
                <p class="mt-1 truncate text-sm leading-5 text-gray-500">4:24 hrs / 4:00 hrs</p>
              </div>
            </div>
          </div>
          <div v-if="displayDiv[idx]" class="py-5 px-10 bg-slate-50">
            <table class="table-auto w-full border-collapse border">
              <thead class="bg-slate-100">
                <tr class="border">
                  <th class="px-4 py-2">Source</th>
                  <th class="px-4 py-2">Date</th>
                  <th class="px-4 py-2">Distance</th>
                  <th class="px-4 py-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border">
                  <td class="px-4 py-2">Strava</td>
                  <td class="px-4 py-2">2021-01-01</td>
                  <td class="px-4 py-2">5.2 mi</td>
                  <td class="px-4 py-2">34:00 min</td>
                </tr>
                <tr class="border">
                  <td class="px-4 py-2">Strava</td>
                  <td class="px-4 py-2">2021-01-02</td>
                  <td class="px-4 py-2">5.2 mi</td>
                  <td class="px-4 py-2">34:00 min</td>
                </tr>
                <tr class="border">
                  <td class="px-4 py-2">Manual</td>
                  <td class="px-4 py-2">2021-01-04</td>
                  <td class="px-4 py-2">5.2 mi</td>
                  <td class="px-4 py-2">34:00 min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </li>
      </ul>
    </div>
  </main>
<!--  <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-2" @click="createRun">Create run</button>-->
<!--  <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-2" @click="createEvent">Create event</button>-->
</template>
