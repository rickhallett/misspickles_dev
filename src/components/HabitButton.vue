<template>
    <div>
      <q-icon name="add_circle_outline" class="text-secondary add-pick-btn" @click="addPick"></q-icon>
      <h1>{{ totalPicksToday }}</h1>
    </div>
</template>

<script>
export default {
  name: 'HabitButton',
}
</script>