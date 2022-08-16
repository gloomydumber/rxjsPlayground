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

module.exports = {
  getDate,
};
