var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = {};
offlineusers = {};



server.listen(3000, '192.168.1.38');

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');


});


/*
// disconnect mi kontrol etme disconnet ise offline a atama!


	socket.on('logout', (data) => {

		const usernames = data.socket.nickname;

		this.io.to(socket.nickname).emit('logout-response', {
			error: false

		});
		socket.disconnect();
		console.log("hey");
	});


*/







io.sockets.on('connection', function (socket) {

	// yeni kullanıcı ekleme!
	socket.on('new user', function (data, callback) {

		if (data in users) {
			callback(false);
		}
		else {

			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket

			console.log("Server a baglanildi");
			console.log("yeni kullanıcı bağlantısı kuruldu" + "->" + data);
			// Kullanıcının İP'sini gösterme!
			console.log("baglanan kisini ipsi :" + socket.request.connection.remoteAddress);
			// 15 saniyede bir ping!

			setInterval(function () { socket.emit("::2"); console.log("şu kullanici icin ping ile kontrol  " + "-->", data); }, 15000); // schedule a heartbeat for every 15 seconds
			updateNicknames();
		}
	});


	// bütün kullanıcıadlarını guncelle
	function updateNicknames() {

		io.sockets.emit('usernames', Object.keys(users));
	}

	// PİNG İLE ONLİNE OFFLİNE KONTROL FONKS
	function kontrol(data) {
		/*
		var tmp;
		tmp = data;
		data = socket.nickname;
		socket.nickname = tmp;
*/
		setInterval(function () {
			if (socket.nickname == users[socket.nickname]) {

				
				console.log("kullanıcı yine  online!", socket.nickname);
				return;
			}
			else {
				console.log("kullanıcı offline oldu! --->", socket.nickname);
				
			}
		}

			, 15000);
	}




	// mesaj gönderme
	socket.on('send message', function (data, callback) {
		var msg = data.trim();
		if (msg.substr(0, 3) === '/w ') { //private mesaj
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if (ind !== -1) {
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				if (name in users) {
					users[name].emit('whisper', { msg: msg, nick: socket.nickname });

					console.log('whisper!');
				} else {
					callback('HATA! lütfen geçerli kullanıcı  girin');
				}

			} else {
				callback('HATA! lütfen mesajınızı girin');
			}
		}
		else {

			io.sockets.emit('new message', { msg: msg, nick: socket.nickname });
		}
	});

	// offline 
	socket.on('disconnect', function (data) {

		if (!socket.nickname) {
			return;
		}
		else {
			kontrol();
			// offlineusers[socket.nickname] != users[socket.nickname];
			console.log("offline kisi->", socket.nickname);

		}

		delete users[socket.nickname];
		updateNicknames();


	});


});