<script setup lang="ts">

const newEventMeta = ref({
  name: '',
  date: '',
  numWeeks: 0,
})

const weekDistances = reactive(new Map())
const weekDurations = reactive(new Map())

const newEventMessage = ref('');

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

</script>

<template>
  <Header/>
  <main>
    <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 border-2">
      <button class="text-md font-semibold py-2 px-2 border-2 rounded-md bg-slate-50 hover:border-red-300">
        Add new event
      </button>
      <div class="bg-white rounded px-8 pt-6 pb-8 mb-4">
        <div class="flex items-center justify-between">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="event-name">
              Event name
            </label>
            <input v-model="newEventMeta.name" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" id="event-name" type="text" placeholder="Event name">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="date-and-time">
              Date and time
            </label>
            <input v-model="newEventMeta.date" id="date-and-time" type="datetime-local" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Date and time">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="weeks">
              Weeks
            </label>
            <input v-model="newEventMeta.numWeeks" type="number" id="weeks" step="1" min="0" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Weeks">
          </div>
        </div>
        <table v-if="newEventMeta.numWeeks > 0" class="table-auto w-full border-collapse border mb-2 text-center">
          <thead class="bg-slate-100">
          <tr class="border">
            <th class="px-4 py-2">Week</th>
            <th class="px-4 py-2">Target distance</th>
            <th class="px-4 py-2">Target duration</th>
          </tr>
          </thead>
          <tbody>
          <tr class="border" v-for="idx in newEventMeta.numWeeks">
            <td class="px-4 py-2">{{ idx }}</td>
            <td class="px-4 py-2">
              <input @change="storeWeekDistance(idx, $event.target.value)" type="number" step="0.5" min="0" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Distance (mi)">
            </td>
            <td class="px-4 py-2">
              <input @change="storeWeekDuration(idx, $event.target.value)" type="number" step="1" min="0" class="border rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" placeholder="Time (min)">
            </td>
          </tr>
          </tbody>
        </table>
        <div class="flex items-center justify-between">
          <button @click="postNewEvent" :disabled="!isValidNewEvent" class="bg-blue-500 disabled:bg-blue-100 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
            Add
          </button>
          <p v-if="newEventMessage !== ''" class="text-blue-500 font-semibold">{{ newEventMessage }}</p>
        </div>
      </div>
    </div>
  </main>
</template>