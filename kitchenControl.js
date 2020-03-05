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

	socket.on('pushOrder', function(data) {
		console.log("Pushing order: " + JSON.stringify(data));
		io.sockets.emit('order made', data);
	});
});


server.listen(8001, '0.0.0.0', function() {
	console.log("Server started.");
});