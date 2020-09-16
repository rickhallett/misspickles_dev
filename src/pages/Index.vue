<template>
  <q-page class="fit column no-wrap justify-around items-center content-start font-applicator bg-gears">
    <HabitButton />
    <Stats />
  </q-page>
</template>

  
<script>
import { version, previousVersion, months, debug, randomTest, autoInc, autoclear } from '../lib/constants';
import { utils } from '../lib/utils';

import SummaryTable from '../components/SummaryTable';
import Stats from '../components/Stats';
import HabitButton from '../components/HabitButton';

const log = utils.createLog("home");

export default {
  name: "Main",
  components: { HabitButton, Stats, SummaryTable },
};
</script>


 

 