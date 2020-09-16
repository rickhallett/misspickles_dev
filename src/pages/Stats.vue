<template>
  <q-page class="fit column no-wrap justify-around items-center content-start font-applicator">
    <SummaryTable />
  </q-page>
</template>

  
<script>
import { version, previousVersion, months, debug, randomTest, autoInc, autoclear } from '../lib/constants';
import { utils } from '../lib/utils';

import SummaryTable from '../components/SummaryTable';

const log = utils.createLog("stats");

export default {
  name: "Stats",
  components: { SummaryTable }
};
</script>

<style>

</style>
 

 