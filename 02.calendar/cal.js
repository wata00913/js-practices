#!/usr/bin/env node
const dateFns = require("date-fns");

const WIDTH = 20;
const DAY_WIDTH = 2;
const MAX_DAYS_WEEK_NUM = 7;

function parseOptions() {
  const today = new Date();
  return require("minimist")(process.argv.slice(2), {
    default: { y: dateFns.getYear(today), m: dateFns.getMonth(today) + 1 },
  });
}

function eachSlice(arr, n, result = []) {
  if (arr.length === 0) return result;
  return eachSlice(arr, n, [...result, arr.splice(0, n)]);
}

function daysOfWeeeks(year, month) {
  const thisMonthDate = new Date(year, month - 1);
  const days = [...Array(dateFns.getDaysInMonth(thisMonthDate))].map(
    (_, i) => i + 1
  );

  const offset = MAX_DAYS_WEEK_NUM - dateFns.getDay(thisMonthDate);
  // 最初の週はeachSliceで分割できないので予め分割する
  return eachSlice(days, MAX_DAYS_WEEK_NUM, [days.splice(0, offset)]);
}

function convertDaysWeekToLine(dWeek, isLast = false) {
  const line = dWeek
    .map((day) => day.toString().padStart(DAY_WIDTH, " "))
    .join(" ");
  return isLast ? line.padEnd(WIDTH, " ") : line.padStart(WIDTH, " ");
}

function render_weeks(dWeeks) {
  const line = dWeeks
    .map((dWeek, idx) => {
      return convertDaysWeekToLine(dWeek, dWeeks.length == idx + 1);
    })
    .join("\n");
  console.log(line);
}

const opts = parseOptions();
console.log(`      ${opts.m}月 ${opts.y}`);
console.log("日 月 火 水 木 金 土");
const dWeeks = daysOfWeeeks(opts.y, opts.m);
render_weeks(dWeeks);
