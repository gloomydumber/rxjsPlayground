process.env.NTBA_FIX_319 = 1; // no warning for node-telegram-bot-api deprecated warning
// https://github.com/yagop/node-telegram-bot-api/issues/540
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config({ path: "../.env" });

const token = process.env.TELEGRAM_TOKEN;
const errChatID = "-1001151156977";
// const bot = new TelegramBot(token, {polling: true});
const bot = new TelegramBot(token);

function getDate() {
  let date = new Date();
  let Y, M, D, h, m, s;
  Y = date.getFullYear();
  M = dateZeroFormatter(date.getMonth() + 1);
  D = dateZeroFormatter(date.getDate());
  h = dateZeroFormatter(date.getHours());
  m = dateZeroFormatter(date.getMinutes());
  s = dateZeroFormatter(date.getSeconds());
  date = `${Y}-${M}-${D} ${h}:${m}:${s} 🤔`;
  return date;
}

function dateZeroFormatter(t) {
  if (t < 10) return `0${t}`;
  else return t;
}

bot.sendMessage(
  errChatID,
  "auto-lender\n `retry operator activated`\n ended at : " + getDate(),
  { parse_mode: "markdown" }
);
