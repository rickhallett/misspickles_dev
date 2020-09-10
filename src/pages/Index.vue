<template>
  <q-page class="flex flex-center">
    <q-icon name="add_circle_outline" class="text-secondary q-mr-lg add-pick-btn" @click="addPick"></q-icon>
    <h1>{{ daysPicks }}</h1>
  </q-page>
</template>

<script>

const utils = {
  *splitNParts(num, parts) {
        let sumParts = 0;
        for (let i = 0; i < parts - 1; i++) {
            const pn = Math.ceil(Math.random() * (num - sumParts));
            yield pn;
            sumParts += pn;
        }
        yield num - sumParts;
    },
    deepEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    },
    createLog(name = 'default') {
        let n = 0;
        return (msg, obj = {}, color = null) => {
            n++;
            const errStr = `${name} log: ${new Date().toISOString()}-LOG-#${n} => ${msg}`;
            const logStr = ` %c${name} log:${new Date().toISOString()}-LOG-#${n} => ${msg}`;
            const colorStr = `${color ? 'color:' + color : ''}`;

            if (msg instanceof Error) {
                console.error(errStr, obj);
                return false;
            }
            
            if (Array.from(Object.keys(obj)).length === 0) {
                console.log(logStr, colorStr);
                return;
            }

            console.log(logStr, colorStr, obj);
            return true;
        }
    },
    genRnd() {
      return Math.ceil(Math.random() * 10) + 1;
    }
};

const log = utils.createLog('app');

export default {
  name: 'PageIndex',
  data() {
    return {
      masterStore: {
        '10-9-2020': {},
        '11-9-2020': {},
        '12-9-2020': {},
        '13-9-2020': {},
        '15-9-2020': {},
        '16-9-2020': {},
        '17-9-2020': {},
        '18-9-2020': {},
      },
      daysPicks: 0,
    }
  },
  methods: {
    addPick() {
      const date = new Date();
      this.masterStore[`${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`][date.getHours()]++;

      this.daysPicks++;
    },
    
  },
  created() {
    log('created', {}, 'green');
    for (let date in this.masterStore) {
      for (let hr = 0; hr < 24; hr++) {
        this.masterStore[date][hr] = utils.genRnd();
      }
    }
    console.log(this.masterStore['10-09-2020']);
    log('masterStore', this.masterStore, 'blue');
  }
}
</script>

<style>
  .add-pick-btn {
    font-size: 158px;
    cursor: pointer;
  }
</style>
 