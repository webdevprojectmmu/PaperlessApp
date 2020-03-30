let connURL = window.location.host;
const socket = io(connURL);
socket.on('connect', function() {
	console.log(socket.id);
});

// incoming orders from the controller
socket.on('new order', function(data) {
	//console.log("order got");
	data.items.forEach(item => {
		item = $.extend(item, itemClient);
	});
	data = $.extend(true, data, orderClient);
	orders.push(data);

	renderMain(orders);
});

// incoming order completions from the controller
socket.on('order complete', function(data) {
	orders.forEach(function(order, index, orders) {
		if("" + order.key + order.table === data) 
			orders.splice(index, 1);
	});
	renderMain(orders);
});

// incoming order quantity change from the controller
socket.on('qty change', function(data) {
	orders.forEach(function(order, index, orders) {
		if("" + order.key + order.table === data.oid) {
			order.items.forEach(item => {
				if(item.num === data.itemNum)
					item.completed = data.completed;
			});
		}
	});
	renderMain(orders);
	
});

// array of order objects.
let orders = [];

// variables to add elements to objects specifically for the client
let orderClient = { time_elapsed: 0 };
let itemClient = { completed: 0 };
let warningTime = 1200; //20 minute warning

//temp function to push order data from itself to the controller
// actual function should come from the main controller when an order is made
function pushOrder(data) {
	console.log("push order: " + JSON.stringify(data));
	socket.emit('push order', data);
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

	bindButtons(orders);
}

/**
 * Constructs HTML `article` elements to be placed in a `main` element on the page. This contains data held in `order` objects within elements of the `article` to be rendered. Outputs the article as a string.
 * @param {order} order 
 * @returns String
 */
function makeArticle(order) {
	//console.log(order);
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
 * Binds events to DOM elements after they've been rendered to the DOM. This method should be called after `renderMain();` is complete and has pushed elements to the document.
 * @param {orders} orders 
 */
function bindButtons(orders) {
	orders.forEach(function(order, index, orders) {
		let oid = "" + order.key + order.table;

		//completion of order
		$("input[name='co" + oid + "']").on('click', function() {
			//console.log("removing " + JSON.stringify(orders[index]));
			socket.emit('complete order', oid);
		});

		order.items.forEach(item => {
			let iid = "" + order.key + item.num;
			//adding quantity complete
			$("input[name*='ac" + iid + "']").on('click', function() {
				//console.log("incrementing qty " + JSON.stringify(item));
				socket.emit('qty update', {oid: oid, itemNum: item.num, completed: ++item.completed});
			});
	
			//removing quantity complete
			$("input[name*='dc" + iid + "']").on('click', function() {
				//console.log("decrementing qty " + JSON.stringify(item));
				socket.emit('qty update', {oid: oid, itemNum: item.num, completed: --item.completed});
			});

			if(item.completed == 0) {
				$("input[name='ac" + iid + "']").prop('disabled', false);
				$("input[name='dc" + iid + "']").prop('disabled', true);
				$("#" + iid).removeClass("complete");
			}
			else if(item.completed == item.qty) {
				$("input[name='ac" + iid + "']").prop('disabled', true);
				$("input[name='dc" + iid + "']").prop('disabled', false);
				$("#" + iid).addClass("complete");
			}
		});
	});
}

/**
 * Converts an Integer of time in miliseconds to a pretty time formatted like `HH:MM:SS`. Adds leading zeroes if necessary.
 * @param {Integer} timestamp 
 * @returns String
 */
function prettyTime(timestamp) {
	timestamp = Math.round(timestamp / 1000);
	let h = (Math.floor((timestamp / 3600) % 24) < 10 ? "0" : "") + Math.floor((timestamp / 3600) % 24);
	let m = (Math.floor((timestamp / 60) % 60) < 10 ? "0" : "") + Math.floor((timestamp / 60) % 60);
	let s = (timestamp % 60 < 10 ? "0" : "") + timestamp % 60;

	return h + ":" + m + ":" + s;
}

//when DOM is ready
$(document).ready(function() {
	let timer = setInterval(function() {
		let pTime = prettyTime(Date.now());
		$("#clock").get(0).innerHTML = pTime;

		//for each order on show
		orders.forEach(function(order, index, orders) {
			let oid = "" + order.key + order.table;
			//resolve elapsed time for each order and flash warning if necessary
			order.time_elapsed = Date.now().valueOf() - order.time;
			if(order.time_elapsed >= warningTime * 1000) $("#" + oid).toggleClass("elapsed");
			$("#" + oid + " .time_elapse").get(0).innerHTML = "Elapsed: " + prettyTime(order.time_elapsed);
		});
	}, 500);
});