let connURL = window.location.host;
const socket = io(connURL);
socket.on('connect', function() {
	console.log(socket.id);
});

socket.on('order made', function(data) {
	console.log("order got");
	data.items.forEach(item => {
		item = $.extend(item, itemClient);
	});
	data = $.extend(true, data, orderClient);
	orders.push(data);

	renderMain(orders);
});

// array of order objects.
let orders = [];

// variables to add elements to objects specifically for the client
let orderClient = { time_elapsed: 0 };
let itemClient = { completed: 0 };

function pushOrder(data) {
	console.log("pushOrder: " + JSON.stringify(data));
	socket.emit('pushOrder', data);
}

/**
 * Renders the innerHTML content of the `main` element on the page. W3C spec defines there should only be one `main` element, so this will wipe everything inside it and populate it with populated `articles` based on population in `makeArticle()`.
 * @param {orders} orders 
 */
function renderMain(orders) {
	let articleElems = "";
	orders.forEach(order => {
		articleElems += makeArticle(order);
	});
	$("main").get(0).innerHTML = articleElems;
}

/**
 * Constructs HTML `article` elements to be placed in a `main` element on the page. This contains data held in `order` objects within elements of the `article` to be rendered. Outputs the article as a string.
 * @param {order} order 
 * @returns String
 */
function makeArticle(order) {
	console.log(order);
	let oid = "" + order.key + order.table;
	let out = '<article id="' + oid + '">';

	//establish items
	out += '<div class="items"><h2>Order Items</h2>';
	if(order.items.length > 0) {
		out += '<table><tr><th>Item</th><th>Qty</th><th>Item Done</th></tr>';
		order.items.forEach(i => {
			let iid = "" + order.key + i.num;
			out += '<tr id="' + iid + '"><td>' + i.name + '</td><td>' + i.completed + '/' + i.qty + '</td><td><input type="button" name="ac'+iid+'" value="+" /><input type="button" name="dc'+iid+'" value="-" /></td></tr>';
		});
		out += '</table>';
	}
	out += '</div>';

	//establish order info
	out += '<div class="info"><table>';
	out += '<tr><td rowspan="2"><h2>Table ' + order.table + '</h2></td><td class="time_order">Time ordered: ' + prettyTime(order.time) + '</td></tr>';
	out += '<tr><td class="time_elapse">Elapsed: ' + prettyTime(order.time_elapsed) + '</td></tr>';
	out += '</table><input type="button" name="co' + oid + '" value="Complete Order" />';
	out += '</div>';

	out += '</article>';

	return out;
}

/**
 * Converts a Date object or Integer to a pretty time formatted like `HH:MM:SS`. Adds leading zeroes if necessary. If Integer is passed in, it will be conveted to a new Date object on UTC.
 * @param {Date | Integer} timestamp 
 * @returns String
 */
function prettyTime(timestamp) {
	timestamp = Math.round(timestamp / 1000);
	let h = (Math.floor((timestamp / 3600) % 24) < 10 ? "0" : "") + Math.floor((timestamp / 3600) % 24);
	let m = (Math.floor((timestamp / 60) % 60) < 10 ? "0" : "") + Math.floor((timestamp / 60) % 60);
	let s = (timestamp % 60 < 10 ? "0" : "") + timestamp % 60;

	return h + ":" + m + ":" + s;
}

$(document).ready(function() {
	let mainElem = $("main").get(0);
});