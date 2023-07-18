<script setup>
const createRun = () => {
  useFetch(
    '/api/run',
    {
      method: 'POST',
      body: {
        distance: 5.2,
        duration: 2040,
        date: new Date(),
      }
    }
  )
}

const createEvent = () => {
  useFetch(
    '/api/event',
    {
      method: 'POST',
      body: {
        name: 'My event',
        date: new Date(),
      }
    }
  )
}

</script>

<template>
  <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
  <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-2" @click="createRun">Create run</button>
  <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-2" @click="createEvent">Create event</button>
</template>
