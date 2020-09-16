import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import {
    linksData,
    version,
    previousVersion,
    months,
    debug,
    randomTest,
    autoInc,
    autoclear,
  } from '../lib/constants';

import { utils } from '../lib/utils';

const log =  utils.createLog('store');

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
        log('action:addPick', {}, 'orange');
        const date = new Date();
        const dateStr = `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  
        //const didInc = this.incrementDate(date, dateStr);
        const didInc = context.dispatch('incrementDate', date, dateStr)
        if (!didInc) {
          // this.addDate(date, dateStr);
          context.dispatch('addDate', date, dateStr);
        }
  
        // this.enrichData();
        context.dispatch('enrichData');
      },
      incrementDate(context, date, dateStr) {
        log('action:incrementDate', {}, 'orange');
        for (let i = 0; i < this.state.masterStore.length; i++) {
          if (this.state.masterStore[i].date === dateStr) {
            this.state.masterStore[i][date.getHours()]++;
            return true;
          }
        }
  
        return false;
      },
      addDate(context, date, dateStr) {
        log('action:addDate', {}, 'orange');
        this.masterStore.push({ date: dateStr });
        for (let hr = 0; hr < 24; hr++) {
          Vue.set(this.state.masterStore[this.state.masterStore.length - 1], hr, 0); //TODO: 
        }
        this.state.masterStore[this.state.masterStore.length - 1][date.getHours()]++;
      },
      enrichData(context) {
        log('action:enrichData', {}, 'orange');
        context.dispatch('store');
        context.dispatch('compressData');
        context.dispatch('summariseData');
        context.dispatch('aggregateAverages');
        context.dispatch('findBestDay');
        context.dispatch('findWorstDay');
        context.dispatch('printGraphData');
      },
      store(context) {
        log('action:store', {}, 'orange');
        localStorage.setItem(
          `misspicker${version}`,
          JSON.stringify(this.masterStore)
        );
      },
      retrieve(context) {
        log('action:retrieve', {}, 'orange');
        return JSON.parse(localStorage.getItem(`misspicker${version}`));
      },
      findBestDay(context) {
        log('action:findBestDay', {}, 'orange');
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
        log('action:findWorstDay', {}, 'orange');
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
        log('action:aggregateAverages', {}, 'orange');
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
        log('action:compressData', {}, 'orange');
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
        log('action:summariseData', {}, 'orange');
        this.state.summaryStore = this.state.compressedStore.map((record) => {
          return {
            date: record.date,
            total: record.morning + record.afternoon + record.night,
          };
        });
      },
      printGraphData(context) {
        log('action:printGraphData', {}, 'orange');
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
  
        // Adds the svg canvas
        var svg = d3
          .select('body')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
        // Get the data
  
        let data = JSON.clone(this.state.summaryStore);
  
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
    },
    mutations: {
      // updateChecked(state, payload) {
      //   state.checkedNames = payload;
      // },
    },
  });