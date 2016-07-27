var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database connection error:'));
db.once('open', function() {
	console.log('Connected to mongodb test database');
});

var app = express();

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(__dirname));

var resultConvSchema = mongoose.Schema({
	date: Date,
	history: Array,
	time: Number
});

var Result = mongoose.model('Result', resultConvSchema);

app.post('/', function(req, res){
	console.log(req.body);
	res.json(req.body);
	var result = new Result({date: req.body.date, history: req.body.history, time: req.body.time});
	result.save(function(err){
		if (err) return console.error(err);
		console.log('Result saved successfully');
	});
});

app.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/');
});