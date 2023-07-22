<script setup lang="ts">
import {formatDate} from "~/utils/dateutils";
import {Event} from "~/types/Event";
import {ApiResult} from "~/types/ApiResult";
import {EventInDb} from "~/types/EventInDb";

const newEventMeta = ref({
  name: '',
  date: '',
  numWeeks: 0,
})

const weekDistances = reactive(new Map())
const weekDurations = reactive(new Map())

const newEventMessage = ref('');

const eventMap: Map<number, Event> = reactive(new Map())

const eventMapToReset: Map<number, Event> = reactive(new Map())

const sortedEventIds = computed(() => {
  return Array.from(eventMap.keys()).sort((a, b) => {
    const aDate = eventMap.get(a)?.date;
    const bDate = eventMap.get(b)?.date;
    if (aDate && bDate) {
      return aDate.getTime() - bDate.getTime();
    }
    return 0;
  });
});

const sortedWeeksForEvent = (eventId: number) => {
  const event = eventMap.get(eventId);
  if (event) {
    return event.weeks.sort((a, b) => a.weekIndex - b.weekIndex);
  }
  return [];
}

const timeoutEventMessage = (message: string, sec: number) => {
  newEventMessage.value = message;
  setTimeout(() => {
    newEventMessage.value = '';
  }, sec * 1000);
}

const storeWeekDistance = (weekIndex: number, distance: number | string) => {
  weekDistances.set(weekIndex, Number(distance))
}

const storeWeekDuration = (weekIndex: number, duration: number | string) => {
  weekDurations.set(weekIndex, Number(duration))
}

const isValidNewEvent = computed(() => {
  const { name, date, numWeeks } = newEventMeta.value
  if (!name || !date || !numWeeks || numWeeks < 1) {
    return false
  }
  for (let i = 1; i < numWeeks + 1; i++) {
    if (!weekDistances.has(i) || !weekDurations.has(i)) {
      return false
    }
    if (weekDistances.get(i) < 0 || weekDurations.get(i) < 0) {
      return false
    }
  }
  return true
})

const resetNewEvent = () => {
  newEventMeta.value = {
    name: '',
    date: '',
    numWeeks: 0,
  }
  weekDistances.clear()
  weekDurations.clear()
}

const postEvent = async (name: string, date: Date) => {
  const res = await $fetch('/api/event', {
    method: 'POST',
    body: {
      name: name,
      date: date,
    }
  })
  console.log(res)
  return res;
}

const getEvents = async (): Promise<ApiResult<EventInDb[]>> => {
  return await $fetch('/api/event?includeWeeks=true')
}

const postWeek = async (
  eventId: number,
  weekIndex: number,
  distanceGoal: number,
  timeGoal: number) => {
  const res = await $fetch('/api/week', {
    method: 'POST',
    body: {
      eventId: eventId,
      weekIndex: weekIndex,
      distanceGoal: distanceGoal,
      timeGoal: timeGoal,
    }
  })
  console.log(res)
  return res;
}

const postNewEvent = async () => {
  if (!isValidNewEvent.value) {
    console.log("New event is invalid")
    return
  }
  console.log("New event is valid. Posting...")
  const res = await postEvent(newEventMeta.value.name, new Date(newEventMeta.value.date));
  if (!res || !res.result) {
    console.log("Error posting new event")
    return
  }
  const eventId = res.result.id
  for (let i = 1; i < newEventMeta.value.numWeeks + 1; i++) {
    const distanceGoal = weekDistances.get(i)
    const timeGoal = weekDurations.get(i)
    await postWeek(eventId, i, distanceGoal, timeGoal)
  }
  timeoutEventMessage("Successfully posted new event!", 10)
  resetNewEvent()
}

const deleteEvent = async (eventId: number) => {
  const res = await $fetch(`/api/event?eventId=${eventId}`, {
    method: 'DELETE'
  })
  eventMap.delete(eventId)
  eventMapToReset.delete(eventId)
}

const resetChangesToEvent = (eventId: number) => {
  console.log("Resetting changes to event " + eventId)
  const event = eventMapToReset.get(eventId)
  if (event) {
    eventMap.set(eventId, event)
  }
}

const saveChangesToEvent = async (eventId: number) => {
  console.log("Saving changes to event " + eventId)
}

const hasEventBeenEdited = (eventId: number) => {
  const event = eventMap.get(eventId)
  const eventToReset = eventMapToReset.get(eventId)
  if (event && eventToReset) {
    return JSON.stringify(event) !== JSON.stringify(eventToReset)
  }
  return false
}

/**
 * Lifecycle hooks
 * */

onMounted(async () => {
  const allEvents = await getEvents();
  console.log(allEvents)
  if (allEvents && allEvents.result) {
    allEvents.result.forEach(event => {
      eventMap.set(Number(event.id), {
        name: event.name,
        date: new Date(event.date),
        weeks: event.weeks.map(week => {
          return {
            eventId: Number(event.id),
            weekIndex: Number(week.weekIndex),
            distanceGoal: Number(week.distanceGoal),
            timeGoal: Number(week.timeGoal),
          }
        })
      })
      eventMapToReset.set(Number(event.id), {
        name: event.name,
        date: new Date(event.date),
        weeks: event.weeks.map(week => {
          return {
            eventId: event.id,
            weekIndex: week.weekIndex,
            distanceGoal: week.distanceGoal,
            timeGoal: week.timeGoal,
          }
        })
      })
    })
  }
})

</script>

<template>
  <Header/>
  <main>
    <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 border-2">
      <div class="bg-white rounded px-8 pt-6 pb-8 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3">
          <div class="mr-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="event-name">
              Event name
            </label>
            <input v-model="newEventMeta.name" class="w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-1" id="event-name" type="text" placeholder="Event name">
          </div>
          <div class="mx-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="date-and-time">
              Date and time
            </label>
            <input v-model="newEventMeta.date" type="datetime-local" class="w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-1" id="date-and-time"  placeholder="Date and time">
          </div>
          <div class="ml-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="weeks">
              Weeks
            </label>
            <input v-model="newEventMeta.numWeeks" type="number" id="weeks" step="1" min="0" class="w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-1" placeholder="Weeks">
          </div>
        </div>
        <table v-if="newEventMeta.numWeeks > 0" class="table-fixed w-full border-collapse border my-2 text-center">
          <thead class="bg-slate-100">
            <tr class="border">
              <th>Week</th>
              <th>Target distance</th>
              <th>Target duration</th>
            </tr>
          </thead>
          <tbody>
          <tr class="border" v-for="idx in newEventMeta.numWeeks">
            <td class="px-2.5 py-1">{{ idx }}</td>
            <td class="px-2.5 py-1">
              <input @change="storeWeekDistance(idx, $event.target.value)" type="number" step="0.5" min="0" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-1" placeholder="Distance (mi)">
            </td>
            <td class="px-2.5 py-1">
              <input @change="storeWeekDuration(idx, $event.target.value)" type="number" step="1" min="0" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-1" placeholder="Time (min)">
            </td>
          </tr>
          </tbody>
        </table>
        <div class="flex items-center justify-between">
          <button @click="postNewEvent" :disabled="!isValidNewEvent" class="bg-blue-500 disabled:bg-blue-100 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
            Add new event
          </button>
          <p v-if="newEventMessage !== ''" class="text-blue-500 font-semibold">{{ newEventMessage }}</p>
        </div>
      </div>
      <hr>
      <div class="my-4 bg-slate-200 py-2 px-2" v-for="eventId in sortedEventIds" v-bind:class="hasEventBeenEdited(eventId) ? 'italic' : ''">
        <div class="flex">
          <div class="w-1/2 leading-6 text-gray-900">
            <div class="text-md font-semibold">
              {{ eventMap.get(eventId).name }}
            </div>
            <div class="mt-1 truncate text-sm leading-5 text-gray-500">
              {{ formatDate(eventMap.get(eventId).date) }}
            </div>
          </div>
          <div class="w-1/2 flex justify-end">
            <button @click="deleteEvent(eventId)" class="px-1 mx-1" type="button" title="Delete">
              🗑️
            </button>
            <button @click="resetChangesToEvent(eventId)" :disabled="!hasEventBeenEdited(eventId)" class="px-1 mx-1" type="button" title="Reset">
              ↩️
            </button>
            <button @click="saveChangesToEvent(eventId)" :disabled="!hasEventBeenEdited(eventId)" class="px-1 mx-1" type="button" title="Save">
              💾
            </button>
          </div>
        </div>
        <table class="table-fixed w-full border-collapse border text-center my-2">
          <thead>
          <tr>
            <th class="w-1">Week</th>
            <th class="w-10">Distance Goal</th>
            <th class="w-10">Duration Goal</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="week in sortedWeeksForEvent(eventId)">
            <td>
              {{ week.weekIndex }}
            </td>
            <td>
              <input type="number" v-model="week.distanceGoal" step="0.5" min="0" class="w-20 border rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5" placeholder="Distance (mi)">
            </td>
            <td>
              <input type="number" v-model="week.timeGoal" step="0.5" min="0" class="w-20 border rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5" placeholder="Duration (min)">
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>