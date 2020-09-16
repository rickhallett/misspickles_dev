<template>
  <!-- <q-page class="fit column no-wrap justify-around items-center content-start font-applicator"> -->
  <q-page class="q-ma-md">
     <h5 class="text-primary">All</h5>
     <q-select :options="months" v-model="selected"></q-select>
    <StatsTable class="q-mb-md"/>
  </q-page>
</template>

<script>
import { version, previousVersion, months, debug, randomTest, autoInc, autoclear, colors } from '../lib/constants';
import { utils } from '../lib/utils';

import StatsTable from '../components/StatsTable';

const log = utils.createLog("chart");

export default {
  name: "Chart",
  components: { StatsTable },
  data() {
    return {
      months: [{ label: 'All', value: 'all' }],
      selected: 'All'
    }
  },
  created() {
    log('chart instance created', {}, colors.success);
    this.$store.dispatch('loadData');
    this.$store.dispatch('enrichData');
  }
};
</script>

<style>
  h5 {
    margin: 10px 0;
    /* margin-bottom: 15vh; */
    text-align: center;
  }
  h6 {
    margin: 10px 0;
    /* margin-bottom: 15vh; */
    text-align: center;
    opacity: 0.5;
  }
</style>
 