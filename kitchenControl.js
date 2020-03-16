const express = require("express");
const path = require("path");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static(path.resolve(__dirname, "./public")));

// order object template. Each new order coming in should copy this object, populate values, and push to orders array.
let order = {
	key: 0,
	table: 0,
	time: Date.now(),
	items: [{
		num: 0,
		name: "",
		qty: 0
	}]
};

io.on('connect', function(socket) {
	console.log(socket.id);

	// pushing incoming order to all clients
	// expected 'data' object: 'order' variable above.
	socket.on('push order', function(data) {
		console.log("Pushing order: " + JSON.stringify(data));
		io.sockets.emit('new order', data);
	});

	// pushing order completion to all clients
	// expected 'data' object: "" + order.key + order.table
	socket.on('complete order', function(data) {
		console.log('completing order: ' + data);
		io.sockets.emit('order complete', data);
	});

	// pushing quantity updates to all clients
	// expected 'data' object: {oid: "" + order.key + order.table, itemNum: order.items[n].num, completed: n}
	socket.on('qty update', function(data) {
		console.log('updating quantity: ' + JSON.stringify(data));
		io.sockets.emit('qty change', data);
	});
});

server.listen(8001, '0.0.0.0', function() {
	console.log("Server started.");
});