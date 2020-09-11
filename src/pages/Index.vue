<template>
  <q-page class="fit column no-wrap justify-around items-center content-start font-applicator">
    <div>
      <q-icon name="add_circle_outline" class="text-secondary add-pick-btn" @click="addPick"></q-icon>
      <h1>{{ totalPicksToday }}</h1>
    </div>

    <q-table
      title
      :data="compressedStore"
      :columns="compressedStoreTableCols"
      row-key="name"
      class="text-primary"
    />

    <div class="sum-graph"></div>
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
  createLog(name = "default") {
    let n = 0;
    return (msg, obj = {}, color = null) => {
      n++;
      const errStr = `${name} log: ${new Date().toISOString()}-LOG-#${n} => ${msg}`;
      const logStr = ` %c${name} log:${new Date().toISOString()}-LOG-#${n} => ${msg}`;
      const colorStr = `${color ? "color:" + color : ""}`;

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
    };
  },
  genRnd() {
    return Math.ceil(Math.random() * 10) + 1;
  },
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const log = utils.createLog("app");

export default {
  name: "Main",
  data() {
    return {
      masterStore: [
        { date: "10-Sep-2020" },
        { date: "11-Sep-2020" },
        { date: "12-Sep-2020" },
        { date: "13-Sep-2020" },
        { date: "14-Sep-2020" },
        { date: "15-Sep-2020" },
        { date: "16-Sep-2020" },
        { date: "17-Sep-2020" },
      ],
      compressedStore: [],
      summaryStore: [],
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
      localStorage.setItem("misspicker", JSON.stringify(this.masterStore));
    },
    retrieve() {
      return JSON.parse(localStorage.getItem("misspicker"));
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

      this.store();

      this.compressData();
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
          day: Number.parseInt(record.date.split("-")[0]),
          total: record.morning + record.afternoon + record.night,
        };
      });
    },
    printGraphData() {
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

      // var data = [
      //   { date: "10-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 1 },
      //   { date: "11-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 4 },
      //   { date: "12-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 5 },
      //   { date: "13-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 6 },
      //   { date: "14-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 1 },
      //   { date: "15-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 4 },
      //   { date: "16-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 5 },
      //   { date: "17-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 6 },
      //   { date: "18-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 1 },
      //   { date: "19-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 4 },
      //   { date: "20-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 5 },
      //   { date: "21-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 6 },
      //   { date: "22-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 1 },
      //   { date: "23-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 4 },
      //   { date: "24-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 5 },
      //   { date: "25-Sep-2020", morning: 1, afternoon: 2, night: 6, total: 6 },
      // ];

      // Get the data

      let data = Object.assign(this.summaryStore);

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
  },
  computed: {
    totalPicksToday() {
      const date = new Date();
      const dateStr = `${date.getDate()}-${
        date.getMonth() + 1
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
    this.compressData();
  },
  mounted() {
    // storage version
    //this.masterStore = this.masterStore.length > 0 ? this.masterStore : this.retrieve() || [];

    //random version
    this.masterStore.forEach((record) => {
      for (let hr = 0; hr < 24; hr++) {
        this.$set(record, hr, utils.genRnd());
      }
    });

    this.compressData();
    this.summariseData();
    this.printGraphData();

    window.t = this.printGraphData;

    console.log("summaryStore", this.summaryStore);
  }
};
</script>

<style>
h1 {
  text-align: center;
  color: grey;
}

.add-pick-btn {
  font-size: 158px;
  cursor: pointer;
}

path {
  stroke: var(--q-color-primary);
  stroke-width: 2;
  fill: none;
}

.axis path,
.axis line {
  fill: none;
  stroke: var(--q-color-primary);
  stroke-width: 1;
  shape-rendering: crispEdges;
}

.label {
  position: absolute;
}

circle {
  cursor: pointer;
  fill: var(--q-color-secondary);;

}

.font-applicator {
  /* font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; */
  font-family: monospace, Cochin, Georgia, Times, "Times New Roman", serif;
  background-color: #dfdbe5;
}
</style>
 

 