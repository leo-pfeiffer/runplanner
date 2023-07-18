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
  <button @click="createRun">Create run</button>
  <button @click="createEvent">Create event</button>
</template>
