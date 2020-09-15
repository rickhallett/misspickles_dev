import { debug } from './constants';

export const utils = {
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
        if (debug.log) {
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
        }
  
        return false;
      };
    },
    genRnd() {
      return Math.ceil(Math.random() * 10) + 1;
    },
    average(nums) {
      return nums.reduce((a, b) => a + b) / nums.length;
    },
  };