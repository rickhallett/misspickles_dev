<template>
  <q-page class="flex flex-center">
    <q-icon name="add_circle_outline" class="text-secondary q-mr-lg add-pick-btn" @click="addPick"></q-icon>
    <h1>{{ totalPicksToday }}</h1>

    <q-table
      title=""
      :data="compressedStore"
      :columns="compressedStoreTableCols"
      row-key="name"
    />

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
      masterStore: [
        { date: '10-9-2020' },
        { date: '11-9-2020' },
        { date: '12-9-2020' },
        { date: '13-9-2020' },
        { date: '14-9-2020' },
        { date: '15-9-2020' },
        { date: '16-9-2020' },
        { date: '17-9-2020' },
      ],
      compressedStore: [
        { date: '10-9-2020', 'morning': 0, 'afternoon': 0, 'night': 0 },
        { date: '11-9-2020', 'morning': 0, 'afternoon': 0, 'night': 0 },
        { date: '12-9-2020', 'morning': 0, 'afternoon': 0, 'night': 0 },
        { date: '13-9-2020', 'morning': 0, 'afternoon': 0, 'night': 0 },
        { date: '14-9-2020', 'morning': 0, 'afternoon': 0, 'night': 0 },
        { date: '15-9-2020', 'morning': 0, 'afternoon': 0, 'night': 0 },
        { date: '16-9-2020', 'morning': 0, 'afternoon': 0, 'night': 0 },
        { date: '17-9-2020', 'morning': 0, 'afternoon': 0, 'night': 0 },
      ],
      daysPicks: 0,
      masterStoreTableCols: [
        { name: 'date', label: 'Date', field: 'date', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '0', label: '0:00', field: '0', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '1', label: '1:00', field: '1', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '2', label: '2:00', field: '2', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '3', label: '3:00', field: '3', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '4', label: '4:00', field: '4', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '5', label: '5:00', field: '5', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '6', label: '6:00', field: '6', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '7', label: '7:00', field: '7', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '8', label: '8:00', field: '8', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '9', label: '9:00', field: '9', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '10', label: '10:00', field: '10', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '11', label: '11:00', field: '11', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '12', label: '12:00', field: '12', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '13', label: '13:00', field: '13', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '14', label: '14:00', field: '14', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '15', label: '15:00', field: '15', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '16', label: '16:00', field: '16', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '17', label: '17:00', field: '17', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '18', label: '18:00', field: '18', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '19', label: '19:00', field: '19', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '20', label: '20:00', field: '20', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '21', label: '21:00', field: '21', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '22', label: '22:00', field: '22', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: '23', label: '23:00', field: '23', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
      ],
      compressedStoreTableCols: [
        { name: 'date', label: 'Date', field: 'date', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: 'morning', label: 'Morning', field: 'morning', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: 'afternoon', label: 'Afternoon', field: 'afternoon', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
        { name: 'night', label: 'Night', field: 'night', sortable: true, style: '', classes: '', headerStyle: '', headerClasses: '', },
      ]
    }
  },
  methods: {
    addPick() {
      const date = new Date();
      const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

      for (let i = 0; i < this.masterStore.length; i++) {
        if (this.masterStore[i].date === dateStr) {
          this.masterStore[i][date.getHours()]++;
          break;
        }
      }

      this.daysPicks++;

      this.compressData();

      console.log('masterStore', this.masterStore);
      console.log('compressedStore', this.compressedStore);
    },
    compressData() {
      for (let record = 0; record < this.masterStore.length; record++) {
        this.$set(this.compressedStore, record, { date: this.masterStore[record].date, 'morning': 0, 'afternoon': 0, 'night': 0 })

        for (let hr = 0; hr < 24; hr++) {
          if (hr >= 0 && hr < 12) {
            this.$set(this.compressedStore[record], 'morning', this.compressedStore[record].morning + this.masterStore[record][hr])
          }
          if (hr >= 12 && hr < 18) {
            this.$set(this.compressedStore[record], 'afternoon', this.compressedStore[record].afternoon + this.masterStore[record][hr])
          }
          if (hr >= 18 && hr <= 23) {
            this.$set(this.compressedStore[record], 'night', this.compressedStore[record].night + this.masterStore[record][hr])
          }
        }
      }
    }
  },
  computed: {
    totalPicksToday() {
      const date = new Date();
      const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      let total = 0;

      for (let i = 0; i < this.masterStore.length; i++) {
        if (this.masterStore[i].date === dateStr) {
          for (let hr = 0; hr < 24; hr++) {
            total += this.masterStore[i][hr];
          }
          break;
        }
      }

      return total;
    }

    
  },
  created() {
    log('created', {}, 'green');

    this.masterStore.forEach(record => {
      for (let hr = 0; hr < 24; hr++) {
        this.$set(record, hr, utils.genRnd());
      }
      
    })

    console.log(this.masterStore['10-09-2020']);
    log('masterStore', this.masterStore, 'blue');

    this.compressData();
  }
}
</script>

<style>
  .add-pick-btn {
    font-size: 158px;
    cursor: pointer;
  }
</style>
 