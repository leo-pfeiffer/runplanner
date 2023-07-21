<script setup lang="ts">

import {Event} from "~/types/Event";
import {Week} from "~/types/Week";
import {ApiResult} from "~/types/ApiResult";
import {Ref} from "vue";
import {RunInDb} from "~/types/RunInDb";
import {Run} from "~/types/Run";
import {EventInDb} from "~/types/EventInDb";

const event: Ref<Event | undefined> = ref();

const events: Ref<Event[]> = ref([])

const runsByWeek: Map<number,Run[]> = reactive(new Map<number, Run[]>());

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

const getEvent = async (eventId: number): Promise<ApiResult<EventInDb>> => {
  return await $fetch(`/api/event?eventId=${eventId}`)
}

const getEvents = async (): Promise<ApiResult<EventInDb[]>> => {
  return await $fetch('/api/event')
}

const getRunsBetweenDates = async (startDate: Date, endDate: Date): Promise<ApiResult<RunInDb[]>> => {
  return await $fetch(`/api/run?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
}

const toggleDiv = (idx: number) => {
  displayDiv.value[idx] = !displayDiv.value[idx];
}

const getStartDateOfEvent = (event: Event): Date => {
  return subtractWeeks(new Date(event.date), event.weeks.length)
}

const subtractWeeks = (date: Date | string, weeks: number): Date => {
  date = new Date(date);
  date.setDate(date.getDate() - 7 * weeks);
  return date;
}

const totalDurationOfWeek = (weekIndex: number) => {
  if (runsByWeek.has(weekIndex)) {
    return runsByWeek.get(weekIndex)?.reduce((acc, run) => acc + run.duration, 0)
  }
  return 0;
}

const totalDistanceOfWeek = (weekIndex: number) => {
  if (runsByWeek.has(weekIndex)) {
    return runsByWeek.get(weekIndex)?.reduce((acc, run) => acc + run.distance, 0)
  }
  return 0;
}

const getWeekIndexForDate = (startDate: Date | string, runDate: Date | string): number => {
  startDate = new Date(startDate);
  runDate = new Date(runDate);
  return Math.floor((runDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 7))
}

const insertedRunIntoSortedList = (list: Run[], run: Run): Run[] => {
  let i = 0;
  while (i < list.length && new Date(list[i].date) < new Date(run.date)) {
    i++;
  }
  list.splice(i, 0, run);
  return list;
}

const selectEvent = async () => {
  const receivedEvent = await getEvent(Number(selected.value));
  if (!receivedEvent || !receivedEvent.result) {
    return;
  }
  event.value = receivedEvent.result;
  displayDiv.value = new Array(event.value.weeks.length).fill(false);
  const endDate = new Date(receivedEvent.result.date);
  const startDate = getStartDateOfEvent(receivedEvent.result)
  const runs = await getRunsBetweenDates(startDate, endDate)
  if (!runs || !runs.result) {
    return;
  }
  runsByWeek.clear()
  runs.result
    .sort((a: RunInDb, b: RunInDb) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach(run => {
      const weekIndex = getWeekIndexForDate(startDate, run.date)
      if (!runsByWeek.has(weekIndex)) {
        runsByWeek.set(weekIndex, [run])
      } else {
        runsByWeek.get(weekIndex)?.push(run)
      }
    })
}

const createRun = () => {
  // todo how to do this more elegantly?
  if (!newRun.value) return;
  const distance = Number(newRun.value.distance);
  const duration = Number(newRun.value.hours) * 3600 + Number(newRun.value.minutes) * 60 + Number(newRun.value.seconds)
  const startTime = newRun.value.startTime ? new Date(newRun.value.startTime) : null;
  if (distance < 0.1 || duration < 30 || !startTime) {
    return;
  }

  const newBaseRun: Run = {
    distance: distance,
    duration: duration,
    date: startTime,
    source: 'manual',
    url: null
  }

  $fetch(
    '/api/run',
    {
      method: 'POST',
      body: newBaseRun
    }
  )
  const startDate = getStartDateOfEvent(event.value!)
  const weekIndex = getWeekIndexForDate(startDate, startTime)
  if (!runsByWeek.has(weekIndex)) {
    runsByWeek.set(weekIndex, [newBaseRun])
  } else {
    const runsOfWeek: Run[] = [...runsByWeek.get(weekIndex)!]
    runsByWeek.set(weekIndex, insertedRunIntoSortedList(runsOfWeek, newBaseRun))
  }
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
                <input type="number" v-model="newRun.distance" step="0.01" min="0" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Distance (mi)">
              </td>
              <td class="py-2">
                <input type="number" v-model="newRun.hours" min="0" class="max-w-[4rem] border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Hrs">
                <input type="number" v-model="newRun.minutes" min="0" class="border max-w-[4rem] rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Min">
                <input type="number" v-model="newRun.seconds" min="0" class="border max-w-[4rem] rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Sec">
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
                <p class="mt-1 truncate text-sm leading-5 text-gray-500">{{ totalDistanceOfWeek(idx) }} mi / {{ week.distanceGoal }} mi</p>
              </div>
            </div>
            <div class="gap-x-4">
              <div class="min-w-0 flex-auto">
                <p class="text-md font-semibold leading-6 text-gray-900">Duration</p>
                <p class="mt-1 truncate text-sm leading-5 text-gray-500">{{ totalDurationOfWeek(idx) }} / {{ week.timeGoal }} hrs</p>
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
                <tr class="border" v-for="run in runsByWeek.get(idx)">
                  <td class="px-4 py-2">{{ run.source }}</td>
                  <td class="px-4 py-2">{{ run.date }}</td>
                  <td class="px-4 py-2">{{ run.distance }}</td>
                  <td class="px-4 py-2">{{ run.duration }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>
