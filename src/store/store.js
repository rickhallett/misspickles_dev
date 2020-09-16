import Vue from 'vue';
import Vuex from 'vuex';

import { colors } from '../lib/constants';

Vue.use(Vuex);

import {
  linksData,
  version,
  previousVersions,
  months,
  debug,
  randomTest,
  autoInc,
  autoclear,
} from '../lib/constants';

import { utils } from '../lib/utils';

const log = utils.createLog('store');

// TODO: split state altering action code into separate mutations
export const store = new Vuex.Store({
  state: {
    version: version,
    leftDrawerOpen: false,
    essentialLinks: linksData,
    masterStore: [],
    compressedStore: [],
    summaryStore: [],
    bestDay: '12-09-2020',
    worstDay: '13-09-2020',
    averages: {
      daily: null,
      am: null,
      pm: null,
      night: null,
    },
    compressedStoreTableCols: [
      {
        name: 'date',
        label: 'Date',
        field: 'date',
        sortable: true,
        style: '',
        classes: '',
        headerStyle: '',
        headerClasses: '',
      },
      {
        name: 'morning',
        label: 'AM',
        field: 'morning',
        sortable: true,
        style: '',
        classes: '',
        headerStyle: '',
        headerClasses: '',
      },
      {
        name: 'afternoon',
        label: 'PM',
        field: 'afternoon',
        sortable: true,
        style: '',
        classes: '',
        headerStyle: '',
        headerClasses: '',
      },
      {
        name: 'night',
        label: 'Night',
        field: 'night',
        sortable: true,
        style: '',
        classes: '',
        headerStyle: '',
        headerClasses: '',
      },
    ],
  },
  getters: {
    getVersion: (state) => {
      return state.version; //return state.todos.find(todo => todo.id === id)
    }
  },
  actions: {
    addPick(context, payload) {
      log('action:addPick', {}, colors.action);
      const date = new Date();
      const dateStr = `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
      log('dateStr', dateStr, colors.var);

      context.dispatch('incrementDate', { date, dateStr }).then(didInc => {
        console.log(dateStr);
        log('didInc', didInc ? 'true' : 'false', colors.var);
        if (!didInc) {
          context.dispatch('addDate', { date, dateStr }).then(() => context.dispatch('enrichData'));
          return;
        }

        context.dispatch('enrichData');
      });

    },
    incrementDate(context, { date, dateStr }) {
      log('action:incrementDate', {}, colors.action);
      for (let i = 0; i < this.state.masterStore.length; i++) {
        if (this.state.masterStore[i].date === dateStr) {
          this.state.masterStore[i][date.getHours()]++;
          return true;
        }
      }

      return false;
    },
    addDate(context, { date, dateStr }) {
      log('action:addDate', {}, colors.action);
      this.state.masterStore.push({ date: dateStr });
      for (let hr = 0; hr < 24; hr++) {
        Vue.set(this.state.masterStore[this.state.masterStore.length - 1], hr, 0); //TODO: 
      }
      this.state.masterStore[this.state.masterStore.length - 1][date.getHours()]++;
    },
    enrichData(context) {
      log('action:enrichData', {}, colors.action);
      context.dispatch('store');
      context.dispatch('compressData');
      context.dispatch('summariseData');
      context.dispatch('aggregateAverages');
      context.dispatch('findBestDay');
      context.dispatch('findWorstDay');
      if (window.location.href == '/graph') context.dispatch('printGraphData');
    },
    store(context) {
      log('action:store', {}, colors.action);
      localStorage.setItem(
        `misspicker${version}`,
        JSON.stringify(this.state.masterStore)
      );
    },
    retrieve(context) {
      log('action:retrieve', {}, colors.action);
      return JSON.parse(localStorage.getItem(`misspicker${version}`));
    },
    findBestDay(context) {
      log('action:findBestDay', {}, colors.action);
      let best = {
        date: null,
        total: 0,
      };

      for (let i = 0; i < this.state.summaryStore.length; i++) {
        const element = this.state.summaryStore[i];
        if (element.total > best.total) {
          best.date = element.date;
          best.total = element.total;
        }
      }

      this.best = best;
    },
    findWorstDay(context) {
      log('action:findWorstDay', {}, colors.action);
      let worst = {
        date: null,
        total: 0,
      };

      for (let i = 0; i < this.state.summaryStore.length; i++) {
        const element = this.state.summaryStore[i];
        if (element.total > worst.total) {
          worst.date = element.date;
          worst.total = element.total;
        }
      }

      this.worst = worst;
    },
    aggregateAverages(context) {
      log('action:aggregateAverages', {}, colors.action);
      function addTotals({ total, count }, record) {
        return {
          total: total + record,
          count: count + 1,
        };
      }

      const morningData = { total: 0, count: 0 };
      const morning = this.state.compressedStore
        .map((r) => r.morning)
        .reduce(addTotals, morningData);

      const { morningTotal, morningCount } = morning;

      this.state.averages.am = morningTotal / morningCount;

      const afternoonData = { total: 0, count: 0 };
      const afternoon = this.state.compressedStore
        .map((r) => r.afternoon)
        .reduce(addTotals, morningData).total;

      const { afternoonTotal, afternoonCount } = afternoon;
      this.state.averages.pm = afternoonData / afternoonTotal;

      const nightData = { total: 0, count: 0 };
      const night = this.state.compressedStore
        .map((r) => r.night)
        .reduce(addTotals, nightData).total;

      const { nightTotal, nightCount } = night;
      this.state.averages.night = nightTotal / nightCount;

      this.state.averages.daily = morningTotal + afternoonTotal + nightTotal;
    },
    compressData(context) {
      log('action:compressData', {}, colors.action);
      for (let record = 0; record < this.state.masterStore.length; record++) {
        Vue.set(this.state.compressedStore, record, {
          date: this.state.masterStore[record].date,
          morning: 0,
          afternoon: 0,
          night: 0,
        });

        for (let hr = 0; hr < 24; hr++) {
          if (hr >= 0 && hr < 12) {
            Vue.set(
              this.state.compressedStore[record],
              'morning',
              this.state.compressedStore[record].morning +
              this.state.masterStore[record][hr]
            );
          }
          if (hr >= 12 && hr < 18) {
            Vue.set(
              this.state.compressedStore[record],
              'afternoon',
              this.state.compressedStore[record].afternoon +
              this.state.masterStore[record][hr]
            );
          }
          if (hr >= 18 && hr <= 23) {
            Vue.set(
              this.state.compressedStore[record],
              'night',
              this.state.compressedStore[record].night + this.state.masterStore[record][hr]
            );
          }
        }
      }
    },
    summariseData(context) {
      log('action:summariseData', {}, colors.action);
      this.state.summaryStore = this.state.compressedStore.map((record) => {
        return {
          date: record.date,
          total: record.morning + record.afternoon + record.night,
        };
      });
    },
    printGraphData(context) {
      log('action:printGraphData', {}, colors.action);
      document.querySelectorAll('svg').forEach((s) => s.remove());

      var label = d3.select('.sum-graph');

      // Set the dimensions of the canvas / graph
      var margin = { top: 30, right: 20, bottom: 30, left: 50 },
        width = 375 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

      // Parse the date / time
      var parseDate = d3.time.format('%d-%b-%Y').parse;

      // Set the ranges
      var x = d3.time.scale().range([0, width]);
      var y = d3.scale.linear().range([height, 0]);

      // Define the axes
      var xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(4);

      var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5);

      // Define the line
      var valueline = d3.svg
        .line()
        .x(function (d) {
          return x(d.date);
        })
        .y(function (d) {
          return y(d.close);
        });

        var size = 202; 

      // Adds the svg canvas
      var svg = d3
        .select('body')
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        // .attr('width', '100%')
        // .attr('height', '100%')
        //.attr('viewBox', '0 0 ' + size + ' ' + size)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Get the data

      let data = JSON.clone(this.state.summaryStore);
      console.log("printGraphData -> this.state.summaryStore", this.state.summaryStore)
      console.log("printGraphData -> data", data)


      //debugger
      data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.close = +d.total;
      });

      console.log("printGraphData -> data:after parse", data)

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

      // Add the valueline path
      svg
        .append('path') // Add the valueline path.
        .attr('class', 'line')
        .attr('d', valueline(data));

      // Add the valueline path.
      svg // Add the valueline path.
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', 6)
        .attr('cx', function (d) {
          return x(d.date);
        })
        .attr('cy', function (d) {
          return y(d.close);
        })
        .on('mouseover', function (d, i) {
          label.style(
            'transform',
            'translate(' + x(d.date) + 'px,' + y(d.total) + 'px)'
          );
          label.text(d.total);
        });

      // Add the X Axis
      svg
        .append('g') // Add the X Axis
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      // Add the Y Axis
      svg
        .append('g') // Add the Y Axis
        .attr('class', 'y axis')
        .call(yAxis);
    },
    printDummyGraphData() {
      var margin = {
        top: 20,
        right: 120,
        bottom: 20,
        left: 120
      },
      width = 960 - margin.right - margin.left,
      height = 800 - margin.top - margin.bottom;
    
    var i = 0,
      duration = 750,
      root;
    
    var tree = d3.layout.tree()
      .size([height, width]);
    
    var diagonal = d3.svg.diagonal()
      .projection(function(d) {
        return [d.y, d.x];
      });
    
    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var flare = {
      "name": "flare",
      "children": [{
        "name": "analytics",
        "children": [{
          "name": "cluster",
          "children": [{
            "name": "AgglomerativeCluster",
            "size": 3938
          }, {
            "name": "CommunityStructure",
            "size": 3812
          }, {
            "name": "HierarchicalCluster",
            "size": 6714
          }, {
            "name": "MergeEdge",
            "size": 743
          }]
        }, {
          "name": "graph",
          "children": [{
            "name": "BetweennessCentrality",
            "size": 3534
          }, {
            "name": "LinkDistance",
            "size": 5731
          }, {
            "name": "MaxFlowMinCut",
            "size": 7840
          }, {
            "name": "ShortestPaths",
            "size": 5914
          }, {
            "name": "SpanningTree",
            "size": 3416
          }]
        }, {
          "name": "optimization",
          "children": [{
            "name": "AspectRatioBanker",
            "size": 7074
          }]
        }]
      }, {
        "name": "animate",
        "children": [{
          "name": "Easing",
          "size": 17010
        }, {
          "name": "FunctionSequence",
          "size": 5842
        }, {
          "name": "interpolate",
          "children": [{
            "name": "ArrayInterpolator",
            "size": 1983
          }, {
            "name": "ColorInterpolator",
            "size": 2047
          }, {
            "name": "DateInterpolator",
            "size": 1375
          }, {
            "name": "Interpolator",
            "size": 8746
          }, {
            "name": "MatrixInterpolator",
            "size": 2202
          }, {
            "name": "NumberInterpolator",
            "size": 1382
          }, {
            "name": "ObjectInterpolator",
            "size": 1629
          }, {
            "name": "PointInterpolator",
            "size": 1675
          }, {
            "name": "RectangleInterpolator",
            "size": 2042
          }]
        }, {
          "name": "ISchedulable",
          "size": 1041
        }, {
          "name": "Parallel",
          "size": 5176
        }, {
          "name": "Pause",
          "size": 449
        }, {
          "name": "Scheduler",
          "size": 5593
        }, {
          "name": "Sequence",
          "size": 5534
        }, {
          "name": "Transition",
          "size": 9201
        }, {
          "name": "Transitioner",
          "size": 19975
        }, {
          "name": "TransitionEvent",
          "size": 1116
        }, {
          "name": "Tween",
          "size": 6006
        }]
      }, {
        "name": "data",
        "children": [{
          "name": "converters",
          "children": [{
            "name": "Converters",
            "size": 721
          }, {
            "name": "DelimitedTextConverter",
            "size": 4294
          }, {
            "name": "GraphMLConverter",
            "size": 9800
          }, {
            "name": "IDataConverter",
            "size": 1314
          }, {
            "name": "JSONConverter",
            "size": 2220
          }]
        }, {
          "name": "DataField",
          "size": 1759
        }, {
          "name": "DataSchema",
          "size": 2165
        }, {
          "name": "DataSet",
          "size": 586
        }, {
          "name": "DataSource",
          "size": 3331
        }, {
          "name": "DataTable",
          "size": 772
        }, {
          "name": "DataUtil",
          "size": 3322
        }]
      }, {
        "name": "display",
        "children": [{
          "name": "DirtySprite",
          "size": 8833
        }, {
          "name": "LineSprite",
          "size": 1732
        }, {
          "name": "RectSprite",
          "size": 3623
        }, {
          "name": "TextSprite",
          "size": 10066
        }]
      }, {
        "name": "flex",
        "children": [{
          "name": "FlareVis",
          "size": 4116
        }]
      }, {
        "name": "physics",
        "children": [{
          "name": "DragForce",
          "size": 1082
        }, {
          "name": "GravityForce",
          "size": 1336
        }, {
          "name": "IForce",
          "size": 319
        }, {
          "name": "NBodyForce",
          "size": 10498
        }, {
          "name": "Particle",
          "size": 2822
        }, {
          "name": "Simulation",
          "size": 9983
        }, {
          "name": "Spring",
          "size": 2213
        }, {
          "name": "SpringForce",
          "size": 1681
        }]
      }, {
        "name": "query",
        "children": [{
          "name": "AggregateExpression",
          "size": 1616
        }, {
          "name": "And",
          "size": 1027
        }, {
          "name": "Arithmetic",
          "size": 3891
        }, {
          "name": "Average",
          "size": 891
        }, {
          "name": "BinaryExpression",
          "size": 2893
        }, {
          "name": "Comparison",
          "size": 5103
        }, {
          "name": "CompositeExpression",
          "size": 3677
        }, {
          "name": "Count",
          "size": 781
        }, {
          "name": "DateUtil",
          "size": 4141
        }, {
          "name": "Distinct",
          "size": 933
        }, {
          "name": "Expression",
          "size": 5130
        }, {
          "name": "ExpressionIterator",
          "size": 3617
        }, {
          "name": "Fn",
          "size": 3240
        }, {
          "name": "If",
          "size": 2732
        }, {
          "name": "IsA",
          "size": 2039
        }, {
          "name": "Literal",
          "size": 1214
        }, {
          "name": "Match",
          "size": 3748
        }, {
          "name": "Maximum",
          "size": 843
        }, {
          "name": "methods",
          "children": [{
            "name": "add",
            "size": 593
          }, {
            "name": "and",
            "size": 330
          }, {
            "name": "average",
            "size": 287
          }, {
            "name": "count",
            "size": 277
          }, {
            "name": "distinct",
            "size": 292
          }, {
            "name": "div",
            "size": 595
          }, {
            "name": "eq",
            "size": 594
          }, {
            "name": "fn",
            "size": 460
          }, {
            "name": "gt",
            "size": 603
          }, {
            "name": "gte",
            "size": 625
          }, {
            "name": "iff",
            "size": 748
          }, {
            "name": "isa",
            "size": 461
          }, {
            "name": "lt",
            "size": 597
          }, {
            "name": "lte",
            "size": 619
          }, {
            "name": "max",
            "size": 283
          }, {
            "name": "min",
            "size": 283
          }, {
            "name": "mod",
            "size": 591
          }, {
            "name": "mul",
            "size": 603
          }, {
            "name": "neq",
            "size": 599
          }, {
            "name": "not",
            "size": 386
          }, {
            "name": "or",
            "size": 323
          }, {
            "name": "orderby",
            "size": 307
          }, {
            "name": "range",
            "size": 772
          }, {
            "name": "select",
            "size": 296
          }, {
            "name": "stddev",
            "size": 363
          }, {
            "name": "sub",
            "size": 600
          }, {
            "name": "sum",
            "size": 280
          }, {
            "name": "update",
            "size": 307
          }, {
            "name": "variance",
            "size": 335
          }, {
            "name": "where",
            "size": 299
          }, {
            "name": "xor",
            "size": 354
          }, {
            "name": "_",
            "size": 264
          }]
        }, {
          "name": "Minimum",
          "size": 843
        }, {
          "name": "Not",
          "size": 1554
        }, {
          "name": "Or",
          "size": 970
        }, {
          "name": "Query",
          "size": 13896
        }, {
          "name": "Range",
          "size": 1594
        }, {
          "name": "StringUtil",
          "size": 4130
        }, {
          "name": "Sum",
          "size": 791
        }, {
          "name": "Variable",
          "size": 1124
        }, {
          "name": "Variance",
          "size": 1876
        }, {
          "name": "Xor",
          "size": 1101
        }]
      }, {
        "name": "scale",
        "children": [{
          "name": "IScaleMap",
          "size": 2105
        }, {
          "name": "LinearScale",
          "size": 1316
        }, {
          "name": "LogScale",
          "size": 3151
        }, {
          "name": "OrdinalScale",
          "size": 3770
        }, {
          "name": "QuantileScale",
          "size": 2435
        }, {
          "name": "QuantitativeScale",
          "size": 4839
        }, {
          "name": "RootScale",
          "size": 1756
        }, {
          "name": "Scale",
          "size": 4268
        }, {
          "name": "ScaleType",
          "size": 1821
        }, {
          "name": "TimeScale",
          "size": 5833
        }]
      }, {
        "name": "util",
        "children": [{
          "name": "Arrays",
          "size": 8258
        }, {
          "name": "Colors",
          "size": 10001
        }, {
          "name": "Dates",
          "size": 8217
        }, {
          "name": "Displays",
          "size": 12555
        }, {
          "name": "Filter",
          "size": 2324
        }, {
          "name": "Geometry",
          "size": 10993
        }, {
          "name": "heap",
          "children": [{
            "name": "FibonacciHeap",
            "size": 9354
          }, {
            "name": "HeapNode",
            "size": 1233
          }]
        }, {
          "name": "IEvaluable",
          "size": 335
        }, {
          "name": "IPredicate",
          "size": 383
        }, {
          "name": "IValueProxy",
          "size": 874
        }, {
          "name": "math",
          "children": [{
            "name": "DenseMatrix",
            "size": 3165
          }, {
            "name": "IMatrix",
            "size": 2815
          }, {
            "name": "SparseMatrix",
            "size": 3366
          }]
        }, {
          "name": "Maths",
          "size": 17705
        }, {
          "name": "Orientation",
          "size": 1486
        }, {
          "name": "palette",
          "children": [{
            "name": "ColorPalette",
            "size": 6367
          }, {
            "name": "Palette",
            "size": 1229
          }, {
            "name": "ShapePalette",
            "size": 2059
          }, {
            "name": "SizePalette",
            "size": 2291
          }]
        }, {
          "name": "Property",
          "size": 5559
        }, {
          "name": "Shapes",
          "size": 19118
        }, {
          "name": "Sort",
          "size": 6887
        }, {
          "name": "Stats",
          "size": 6557
        }, {
          "name": "Strings",
          "size": 22026
        }]
      }, {
        "name": "vis",
        "children": [{
          "name": "axis",
          "children": [{
            "name": "Axes",
            "size": 1302
          }, {
            "name": "Axis",
            "size": 24593
          }, {
            "name": "AxisGridLine",
            "size": 652
          }, {
            "name": "AxisLabel",
            "size": 636
          }, {
            "name": "CartesianAxes",
            "size": 6703
          }]
        }, {
          "name": "controls",
          "children": [{
            "name": "AnchorControl",
            "size": 2138
          }, {
            "name": "ClickControl",
            "size": 3824
          }, {
            "name": "Control",
            "size": 1353
          }, {
            "name": "ControlList",
            "size": 4665
          }, {
            "name": "DragControl",
            "size": 2649
          }, {
            "name": "ExpandControl",
            "size": 2832
          }, {
            "name": "HoverControl",
            "size": 4896
          }, {
            "name": "IControl",
            "size": 763
          }, {
            "name": "PanZoomControl",
            "size": 5222
          }, {
            "name": "SelectionControl",
            "size": 7862
          }, {
            "name": "TooltipControl",
            "size": 8435
          }]
        }, {
          "name": "data",
          "children": [{
            "name": "Data",
            "size": 20544
          }, {
            "name": "DataList",
            "size": 19788
          }, {
            "name": "DataSprite",
            "size": 10349
          }, {
            "name": "EdgeSprite",
            "size": 3301
          }, {
            "name": "NodeSprite",
            "size": 19382
          }, {
            "name": "render",
            "children": [{
              "name": "ArrowType",
              "size": 698
            }, {
              "name": "EdgeRenderer",
              "size": 5569
            }, {
              "name": "IRenderer",
              "size": 353
            }, {
              "name": "ShapeRenderer",
              "size": 2247
            }]
          }, {
            "name": "ScaleBinding",
            "size": 11275
          }, {
            "name": "Tree",
            "size": 7147
          }, {
            "name": "TreeBuilder",
            "size": 9930
          }]
        }, {
          "name": "events",
          "children": [{
            "name": "DataEvent",
            "size": 2313
          }, {
            "name": "SelectionEvent",
            "size": 1880
          }, {
            "name": "TooltipEvent",
            "size": 1701
          }, {
            "name": "VisualizationEvent",
            "size": 1117
          }]
        }, {
          "name": "legend",
          "children": [{
            "name": "Legend",
            "size": 20859
          }, {
            "name": "LegendItem",
            "size": 4614
          }, {
            "name": "LegendRange",
            "size": 10530
          }]
        }, {
          "name": "operator",
          "children": [{
            "name": "distortion",
            "children": [{
              "name": "BifocalDistortion",
              "size": 4461
            }, {
              "name": "Distortion",
              "size": 6314
            }, {
              "name": "FisheyeDistortion",
              "size": 3444
            }]
          }, {
            "name": "encoder",
            "children": [{
              "name": "ColorEncoder",
              "size": 3179
            }, {
              "name": "Encoder",
              "size": 4060
            }, {
              "name": "PropertyEncoder",
              "size": 4138
            }, {
              "name": "ShapeEncoder",
              "size": 1690
            }, {
              "name": "SizeEncoder",
              "size": 1830
            }]
          }, {
            "name": "filter",
            "children": [{
              "name": "FisheyeTreeFilter",
              "size": 5219
            }, {
              "name": "GraphDistanceFilter",
              "size": 3165
            }, {
              "name": "VisibilityFilter",
              "size": 3509
            }]
          }, {
            "name": "IOperator",
            "size": 1286
          }, {
            "name": "label",
            "children": [{
              "name": "Labeler",
              "size": 9956
            }, {
              "name": "RadialLabeler",
              "size": 3899
            }, {
              "name": "StackedAreaLabeler",
              "size": 3202
            }]
          }, {
            "name": "layout",
            "children": [{
              "name": "AxisLayout",
              "size": 6725
            }, {
              "name": "BundledEdgeRouter",
              "size": 3727
            }, {
              "name": "CircleLayout",
              "size": 9317
            }, {
              "name": "CirclePackingLayout",
              "size": 12003
            }, {
              "name": "DendrogramLayout",
              "size": 4853
            }, {
              "name": "ForceDirectedLayout",
              "size": 8411
            }, {
              "name": "IcicleTreeLayout",
              "size": 4864
            }, {
              "name": "IndentedTreeLayout",
              "size": 3174
            }, {
              "name": "Layout",
              "size": 7881
            }, {
              "name": "NodeLinkTreeLayout",
              "size": 12870
            }, {
              "name": "PieLayout",
              "size": 2728
            }, {
              "name": "RadialTreeLayout",
              "size": 12348
            }, {
              "name": "RandomLayout",
              "size": 870
            }, {
              "name": "StackedAreaLayout",
              "size": 9121
            }, {
              "name": "TreeMapLayout",
              "size": 9191
            }]
          }, {
            "name": "Operator",
            "size": 2490
          }, {
            "name": "OperatorList",
            "size": 5248
          }, {
            "name": "OperatorSequence",
            "size": 4190
          }, {
            "name": "OperatorSwitch",
            "size": 2581
          }, {
            "name": "SortOperator",
            "size": 2023
          }]
        }, {
          "name": "Visualization",
          "size": 16540
        }]
      }]
    }
    
    root = flare;
    root.x0 = height / 2;
    root.y0 = 0;
    
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }
    
    root.children.forEach(collapse);
    update(root);
    
    
    d3.select(self.frameElement).style("height", "800px");
    
    function update(source) {
    
      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);
    
      // Normalize for fixed-depth.
      nodes.forEach(function(d) {
        d.y = d.depth * 180;
      });
    
      // Update the nodes…
      var node = svg.selectAll("g.node")
        .data(nodes, function(d) {
          return d.id || (d.id = ++i);
        });
    
      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click);
    
      nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
        });
    
      nodeEnter.append("text")
        .attr("x", function(d) {
          return d.children || d._children ? -10 : 10;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
        })
        .text(function(d) {
          return d.name;
        })
        .style("fill-opacity", 1e-6);
    
      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {
          return "translate(" + d.y + "," + d.x + ")";
        });
    
      nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
        });
    
      nodeUpdate.select("text")
        .style("fill-opacity", 1);
    
      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();
    
      nodeExit.select("circle")
        .attr("r", 1e-6);
    
      nodeExit.select("text")
        .style("fill-opacity", 1e-6);
    
      // Update the links…
      var link = svg.selectAll("path.link")
        .data(links, function(d) {
          return d.target.id;
        });
    
      // Enter any new links at the parent's previous position.
      link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {
            x: source.x0,
            y: source.y0
          };
          return diagonal({
            source: o,
            target: o
          });
        });
    
      // Transition links to their new position.
      link.transition()
        .duration(duration)
        .attr("d", diagonal);
    
      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {
            x: source.x,
            y: source.y
          };
          return diagonal({
            source: o,
            target: o
          });
        })
        .remove();
    
      // Stash the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }
    
    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }
    }
  },
  mutations: {
    // updateChecked(state, payload) {
    //   state.checkedNames = payload;
    // },
  },
});