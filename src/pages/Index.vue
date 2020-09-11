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

    <div id="my_dataviz"></div>
  </q-page>
</template>

<script>
const d3 = require("d3");
console.log(d3);

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

const log = utils.createLog("app");

export default {
  name: "Main",
  data() {
    return {
      masterStore: [
        { date: "10-9-2020" },
        { date: "11-9-2020" },
        { date: "12-9-2020" },
        { date: "13-9-2020" },
        { date: "14-9-2020" },
        { date: "15-9-2020" },
        { date: "16-9-2020" },
        { date: "17-9-2020" },
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
        date.getMonth() + 1
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

    console.log("summaryStore", this.summaryStore);

    // set the dimensions and margins of the graph
    const height = 400;
    const width = 400; 
    const margin = { top: 20,right: 40, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // append the svg object to the body of the page
    let svg = d3
      .select("#my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    // .append("g")
    //   .attr("transform",
    //         "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleLinear().domain([1, 31]).range([0, innerWidth]); //scope of data going out / pixels
    const yScale = d3.scaleLinear().domain([0, 300]).range([innerHeight, 0]);

    const circle = svg
      .selectAll(".ufoCircle") //select all elements with class ufoCircle. (There currently are none)
      .data(this.summaryStore) //attach the data
      .enter()
      .append("circle") //aopend one circle for each data point. There are 11 data points, so there will be 11 circles
      .attr("class", "totalCircle") //give each circle class ufoCircle
      .attr("r", 8) //assign radius
      // Position the circles based on their x and y attributes.
      .attr("cx", function (d) {
        return xScale(d.day);
      })
      .attr("cy", function (d) {
        return yScale(d.total);
      });

    const text = svg
      .selectAll("text")
      .data(this.summaryStore)
      .enter()
      .append("text")
      .attr("x", function (d) {
        return xScale(d.day);
      })
      .attr("y", function (d) {
        return yScale(d.total);
      })
      .text(function (d) {
        return d.total;
      })
      .attr("dx", 10) //moves text 10px (right) on the x axis
      .attr("dy", -10); //moves text -10px (up) on the y axis. These help move the text so it's not overlapping with the circles

    const dataGroup = svg.selectAll('.ufoGroup')
      .data(data).enter().append('g') 
      .attr('class', 'dataGroup')
      .attr('transform', function(d) { return 'translate(' + xScale(d.day) + ',' + yScale(d.total) + ')'});

    //append circles to ufoGroup
    dataGroup.append('circle')
      .attr('class', 'ufoCircle')
      .attr('r', 10)

    //append text to ufoGroup
    dataGroup.append('text')
      .attr('class', 'ufoText')
      .attr('dx', 10)
      .attr('dy', -10)
      .text(function(d) { return d.total})

    

    //Define an Xaxis for your scale with the ticks oriented on the bottom
    const xAxis = d3.axisBottom(xScale)
                    .tickSize(-innerHeight);

    //Define a yAxis with your ticks oriented on the left.
    const yAxis = d3.axisLeft(yScale);

    //Append a g element to your svg, and call your xAxis function.
    const xAxisGroup = svg
      .append("g")
      .attr("class", "x axis") //gives group the classes 'x' and 'axis'
      .call(xAxis);

    //Append a g element to your svg, and call your yAxis function.
    const yAxisGroup = svg
      .append("g")
      .attr("class", "y axis") //gives group the classes 'y' and 'axis'
      .call(yAxis);
  },
};

//Read the data
// d3.json(JSON.stringify(this.compressedStore),
//   // When reading the csv, I must format letiables:
//   function(d){
//     return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
//   },

//   // Now I can use this dataset:
//   function(data) {
//     // Add X axis --> it is a date format
//     let x = d3.scaleTime()
//       .domain(d3.extent(data, function(d) { return d.date; }))
//       .range([ 0, width ]);
//     svg.append("g")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));
//     // Add Y axis
//     let y = d3.scaleLinear()
//       .domain( [8000, 9200])
//       .range([ height, 0 ]);
//     svg.append("g")
//       .call(d3.axisLeft(y));
//     // Add the line
//     svg.append("path")
//       .datum(data)
//       .attr("fill", "none")
//       .attr("stroke", "#69b3a2")
//       .attr("stroke-width", 1.5)
//       .attr("d", d3.line()
//         .x(function(d) { return x(d.date) })
//         .y(function(d) { return y(d.value) })
//         )
//     // Add the points
//     svg
//       .append("g")
//       .selectAll("dot")
//       .data(data)
//       .enter()
//       .append("circle")
//         .attr("cx", function(d) { return x(d.date) } )
//         .attr("cy", function(d) { return y(d.value) } )
//         .attr("r", 5)
//         .attr("fill", "#69b3a2")
// });
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

svg {
  border: 1px solid var(--q-color-secondary);
}

.totalCircle {
  fill: var(--q-color-secondary);
}

.circle {
}

.axis line {
  stroke-width:1px;
  stroke: #ccc;
  stroke-dasharray: 2px 2px;
}

.axis text {
  font-size: 12px;
  fill: #777;
}

.axis path {
  display: none;
}

.font-applicator {
  /* font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; */
  font-family: monospace, Cochin, Georgia, Times, "Times New Roman", serif;
  background-color: #dfdbe5;
}
</style>
 

 