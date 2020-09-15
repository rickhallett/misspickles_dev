<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>Habitsa</q-toolbar-title>

        <div>App v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8">Navigation</q-item-label>
        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";
import { linksData, version, previousVersion, months, debug, randomTest, autoInc, autoclear } from '../lib/constants';
import { utils } from '../lib/utils';

const log = utils.createLog('main');

export default {
  name: "MainLayout",
  components: { EssentialLink },
  data() {
    return {
      leftDrawerOpen: false,
      essentialLinks: linksData,
      masterStore: [],
      compressedStore: [],
      summaryStore: [],
      bestDay: "12-09-2020",
      worstDay: "13-09-2020",
      averages: {
        daily: null,
        am: null,
        pm: null,
        night: null,
      },
      compressedStoreTableCols: [
        {
          name: "date",
          label: "Date",
          field: "date",
          sortable: true,
          style: "",
          classes: "",
          headerStyle: "",
          headerClasses: "",
        },
        {
          name: "morning",
          label: "AM",
          field: "morning",
          sortable: true,
          style: "",
          classes: "",
          headerStyle: "",
          headerClasses: "",
        },
        {
          name: "afternoon",
          label: "PM",
          field: "afternoon",
          sortable: true,
          style: "",
          classes: "",
          headerStyle: "",
          headerClasses: "",
        },
        {
          name: "night",
          label: "Night",
          field: "night",
          sortable: true,
          style: "",
          classes: "",
          headerStyle: "",
          headerClasses: "",
        },
      ],
    };
  },
  methods: {
    store() {
      localStorage.setItem(
        `misspicker${version}`,
        JSON.stringify(this.masterStore)
      );
    },
    retrieve() {
      return JSON.parse(localStorage.getItem(`misspicker${version}`));
    },
    addPick() {
      const date = new Date();
      const dateStr = `${date.getDate()}-${
        months[date.getMonth()]
      }-${date.getFullYear()}`;

      const didInc = this.incrementDate(date, dateStr);
      if (!didInc) {
        this.addDate(date, dateStr);
      }

      this.enrichData();
    },
    findBestDay() {
      let best = {
        date: null,
        total: 0,
      };

      for (let i = 0; i < this.summaryStore.length; i++) {
        const element = this.summaryStore[i];
        if (element.total > best.total) {
          best.date = element.date;
          best.total = element.total;
        }
      }

      this.best = best;
    },
    findWorstDay() {
      let worst = {
        date: null,
        total: 0,
      };

      for (let i = 0; i < this.summaryStore.length; i++) {
        const element = this.summaryStore[i];
        if (element.total > worst.total) {
          worst.date = element.date;
          worst.total = element.total;
        }
      }

      this.worst = worst;
    },
    aggregateAverages() {
      function addTotals({ total, count }, record) {
        return {
          total: total + record,
          count: count + 1,
        };
      }

      const morningData = { total: 0, count: 0 };
      const morning = this.compressedStore
        .map((r) => r.morning)
        .reduce(addTotals, morningData);

      const { morningTotal, morningCount } = morning;

      this.averages.am = morningTotal / morningCount;

      const afternoonData = { total: 0, count: 0 };
      const afternoon = this.compressedStore
        .map((r) => r.afternoon)
        .reduce(addTotals, morningData).total;

      const { afternoonTotal, afternoonCount } = afternoon;
      this.averages.pm = afternoonData / afternoonTotal;

      const nightData = { total: 0, count: 0 };
      const night = this.compressedStore
        .map((r) => r.night)
        .reduce(addTotals, nightData).total;

      const { nightTotal, nightCount } = night;
      this.averages.night = nightTotal / nightCount;

      this.averages.daily = morningTotal + afternoonTotal + nightTotal;
    },
    incrementDate(date, dateStr) {
      for (let i = 0; i < this.masterStore.length; i++) {
        if (this.masterStore[i].date === dateStr) {
          this.masterStore[i][date.getHours()]++;
          return true;
        }
      }

      return false;
    },
    addDate(date, dateStr) {
      this.masterStore.push({ date: dateStr });
      for (let hr = 0; hr < 24; hr++) {
        this.$set(this.masterStore[this.masterStore.length - 1], hr, 0);
      }
      this.masterStore[this.masterStore.length - 1][date.getHours()]++;
    },
    compressData() {
      for (let record = 0; record < this.masterStore.length; record++) {
        this.$set(this.compressedStore, record, {
          date: this.masterStore[record].date,
          morning: 0,
          afternoon: 0,
          night: 0,
        });

        for (let hr = 0; hr < 24; hr++) {
          if (hr >= 0 && hr < 12) {
            this.$set(
              this.compressedStore[record],
              "morning",
              this.compressedStore[record].morning +
                this.masterStore[record][hr]
            );
          }
          if (hr >= 12 && hr < 18) {
            this.$set(
              this.compressedStore[record],
              "afternoon",
              this.compressedStore[record].afternoon +
                this.masterStore[record][hr]
            );
          }
          if (hr >= 18 && hr <= 23) {
            this.$set(
              this.compressedStore[record],
              "night",
              this.compressedStore[record].night + this.masterStore[record][hr]
            );
          }
        }
      }
    },
    summariseData() {
      this.summaryStore = this.compressedStore.map((record) => {
        return {
          date: record.date,
          total: record.morning + record.afternoon + record.night,
        };
      });
    },
    printGraphData() {
      log("printing graph data", {}, "yellow");
      document.querySelectorAll("svg").forEach((s) => s.remove());

      var label = d3.select(".sum-graph");

      // Set the dimensions of the canvas / graph
      var margin = { top: 30, right: 20, bottom: 30, left: 50 },
        width = 375 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

      // Parse the date / time
      var parseDate = d3.time.format("%d-%b-%Y").parse;

      // Set the ranges
      var x = d3.time.scale().range([0, width]);
      var y = d3.scale.linear().range([height, 0]);

      // Define the axes
      var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(4);

      var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

      // Define the line
      var valueline = d3.svg
        .line()
        .x(function (d) {
          return x(d.date);
        })
        .y(function (d) {
          return y(d.close);
        });

      // Adds the svg canvas
      var svg = d3
        .select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Get the data

      let data = JSON.clone(this.summaryStore);

      data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.close = +d.total;
      });

      // Scale the range of the data
      x.domain(
        d3.extent(data, function (d) {
          return d.date;
        })
      );
      y.domain([
        0,
        d3.max(data, function (d) {
          return d.total;
        }),
      ]);

      // Add the valueline path.
      svg
        .append("path") // Add the valueline path.
        .attr("class", "line")
        .attr("d", valueline(data));

      // Add the valueline path.
      svg // Add the valueline path.
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 6)
        .attr("cx", function (d) {
          return x(d.date);
        })
        .attr("cy", function (d) {
          return y(d.close);
        })
        .on("mouseover", function (d, i) {
          label.style(
            "transform",
            "translate(" + x(d.date) + "px," + y(d.total) + "px)"
          );
          label.text(d.total);
        });

      // Add the X Axis
      svg
        .append("g") // Add the X Axis
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // Add the Y Axis
      svg
        .append("g") // Add the Y Axis
        .attr("class", "y axis")
        .call(yAxis);
    },
    enrichData() {
      this.store();
      this.compressData();
      this.summariseData();
      this.aggregateAverages();
      this.findBestDay();
      this.findWorstDay();
      this.printGraphData();
    },
  },
  computed: {
    totalPicksToday() {
      const date = new Date();
      const dateStr = `${date.getDate()}-${
        months[date.getMonth()]
      }-${date.getFullYear()}`;
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
    },
  },
  created() {
    log("app instance created", {}, "limegreen");
    this.compressData();
    localStorage.removeItem("misspicker");
    localStorage.removeItem(`misspicker${previousVersion}`);
  },
  mounted() {
    log("app instance mounted", {}, "limegreen");
    if (randomTest) {
      this.masterStore = [
        { date: "10-Sep-2020" },
        { date: "11-Sep-2020" },
        { date: "12-Sep-2020" },
        { date: "13-Sep-2020" },
        { date: "14-Sep-2020" },
        { date: "15-Sep-2020" },
        { date: "16-Sep-2020" },
        { date: "17-Sep-2020" },
      ];
      this.masterStore.forEach((record) => {
        for (let hr = 0; hr < 24; hr++) {
          this.$set(record, hr, utils.genRnd());
        }
      });
    } else {
      this.masterStore =
        this.masterStore.length > 0 ? this.masterStore : this.retrieve() || [];
    }

    this.enrichData();

    window.t = this.printGraphData;
    window.p = this.addPick;

    if (autoInc.now) {
      setInterval(() => {
        this.addPick();
      }, 50);
    }

    if (autoclear) {
      console.clear();
    }

    console.log("masterStore", this.masterStore);
    console.log("compressedStore", this.compressedStore);
    console.log("summaryStore", this.summaryStore);
  },
};
</script>
