#!/usr/bin/env node
const dateFns = require("date-fns");

const WIDTH = 20;
const DAY_WIDTH = 2;
const MAX_DAYS_WEEK_NUM = 7;

const opts = parseOptions();
console.log(`      ${opts.m}月 ${opts.y}`);
console.log("日 月 火 水 木 金 土");
const daysOfWeeks = buildDaysOfWeeeks(opts.y, opts.m);
renderWeeks(daysOfWeeks);

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

function buildDaysOfWeeeks(year, month) {
  const thisMonthDate = new Date(year, month - 1);
  const days = [...Array(dateFns.getDaysInMonth(thisMonthDate))].map(
    (_, i) => i + 1
  );

  const offset = MAX_DAYS_WEEK_NUM - dateFns.getDay(thisMonthDate);
  // 最初の週はeachSliceで分割できないので予め分割する
  return eachSlice(days, MAX_DAYS_WEEK_NUM, [days.splice(0, offset)]);
}

function convertDaysWeekToLine(daysOfWeek, isFirstWeek = false) {
  const line = daysOfWeek
    .map((day) => day.toString().padStart(DAY_WIDTH, " "))
    .join(" ");

  if (isFirstWeek) {
    return line.padStart(WIDTH, " ");
  } else {
    return line;
  }
}

function renderWeeks(daysOfWeeks) {
  const line = daysOfWeeks
    .map((daysOfWeek, idx) => {
      return convertDaysWeekToLine(daysOfWeek, idx === 0);
    })
    .join("\n");
  console.log(line);
}
