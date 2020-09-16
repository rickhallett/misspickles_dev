<template>
  <q-card>
      <q-list>
        <q-item class="row justify-between bg-grey-4">
            <q-item-section>Best Day</q-item-section>
            <q-item-section caption class="q-ml-md">{{ bestDay }}</q-item-section>
        </q-item>
        <q-item class="row justify-between">
            <q-item-section>Worst Day</q-item-section>
            <q-item-section caption class="q-ml-md">{{ worstDay }}</q-item-section>
        </q-item>
        <q-item class="row justify-between bg-grey-4"> 
            <q-item-section>Daily Average</q-item-section>
            <q-item-section caption>{{ averages.daily }}</q-item-section>
        </q-item>
        <q-item class="row justify-between">
            <q-item-section>AM Average</q-item-section>
            <q-item-section caption>{{ averages.am }}</q-item-section>
        </q-item>
        <q-item class="row justify-between bg-grey-4">
            <q-item-section>PM Average</q-item-section>
            <q-item-section caption>{{ averages.pm }}</q-item-section>
        </q-item>
        <q-item class="row justify-between">
            <q-item-section>Night Average</q-item-section>
            <q-item-section caption>{{ averages.night }}</q-item-section>
        </q-item>
      </q-list>
    </q-card>
</template>

<script>
export default {
  name: 'SummaryTable',
  data() {
    return {
      bestDay: this.$store.state.bestDay,
      worstDay: this.$store.state.worstDay,
      averages: {
        daily: this.$store.state.averages.daily,
        am: this.$store.state.averages.am,
        pm: this.$store.state.averages.pm,
        night: this.$store.state.averages.night
      }
    };
  },
  created() {

  }
}
</script>
