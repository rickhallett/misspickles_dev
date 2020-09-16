<template>
  <q-page class="fit column no-wrap justify-around items-center content-start font-applicator">
  <!-- <q-page class=""> -->
    <div class="sum-graph"></div>
  </q-page>
</template>

  
<script>
import { version, previousVersion, months, debug, randomTest, autoInc, autoclear } from '../lib/constants';
import { utils } from '../lib/utils';

const log = utils.createLog("graph");

export default {
  name: "Graph",
  created() {
    this.$store.dispatch('printGraphData');
    //this.$store.dispatch('printDummyGraphData');
    //
  }
};
</script>

<style>
  svg {
    position: absolute;
    top: 50px;
    left: 0;
  }
</style>
 

 