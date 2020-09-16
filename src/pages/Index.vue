<template>
  <q-page class="fit column no-wrap justify-center items-center content-start font-applicator bg-gears">
    <HabitButton class="q-mb-xl" />
    <h2 class="text-primary">{{ totalPicksToday }}</h2>
  </q-page>
</template>

  
<script>
import { version, previousVersion, months, debug, randomTest, autoInc, autoclear } from '../lib/constants';
import { utils } from '../lib/utils';

import SummaryTable from '../components/SummaryTable';
import StatsTable from '../components/StatsTable';
import HabitButton from '../components/HabitButton';

const log = utils.createLog("home");

export default {
  name: "Main",
  components: { HabitButton, StatsTable, SummaryTable },
  data() {
    return {}
  },
  computed: {
    totalPicksToday() {
      return this.$store.getters.totalPicksToday;
    }
  },
  mounted() {
    this.$store.dispatch('loadData');
    this.$store.dispatch("enrichData");
  }
};
</script>

<style>
  h2 {
    font-size: 150px;
    margin: 0;
    margin-bottom: 30px;
    /* opacity: 0.7; */
  }
</style>


 

 