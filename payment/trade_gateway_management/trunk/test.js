const ejs = require('ejs');

console.log(ejs.render({title: 1}, {
    filename: './view/payment/record'
}));
console.log(ejs.render('<%= test%>',{test: 1}));