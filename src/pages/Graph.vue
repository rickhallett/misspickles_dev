<template>
  <!-- <q-page class="fit column no-wrap justify-around items-center content-start font-applicator"> -->
  <q-page class="q-ma-md">
    <h5 class="text-primary">All</h5>
    <q-select :options="months" v-model="selected"></q-select>
    <div class="sum-graph"></div>
  </q-page>
</template>

  
<script>
import {
  version,
  previousVersion,
  months,
  debug,
  randomTest,
  autoInc,
  autoclear,
} from "../lib/constants";
import { utils } from "../lib/utils";

const log = utils.createLog("graph");

export default {
  name: "Graph",
  data() {
    return {
      months: [{ label: 'All', value: 'all' }],
      selected: 'All'
    }
  },
  created() {
    this.$store.dispatch('loadData');
    this.$store.dispatch("enrichData");
  },
};
</script>

<style>
  h5 {
    margin: 10px 0;
    text-align: center;
  }

  svg {
    position: absolute;
    top: 170px;
    left: 0;
  }
</style>
 

 