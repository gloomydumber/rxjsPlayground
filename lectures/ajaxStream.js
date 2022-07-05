global.XMLHttpRequest = require("xhr2");
const { ajax } = require("rxjs/ajax");

const obs$ = ajax("https://api.github.com/users?per_page=5");
obs$.subscribe((result) => console.log(result.response));
