var request = require('request'),
  Doorbell = require('./doorbells.model');

var controller = {
  yoCallback: yoCallback,
  notify: notify,
  create: create
};

module.exports = controller;

////////////

var api = {
  url: 'https://api.justyo.co/yo',
  token: require('../yo.key')
};

function yoCallback(req, res) {
  console.log('got GET request with params', req.query);
  submitYo(req.query.username);
  res.sendStatus(200);
}

function notify(req, res) {

  Doorbell.findOne({
    tesselId: req.body.tesselId
  }, onResult);

  function onResult(err, tessel) {
    if (err) {
      res.sendStatus(400);
      return;
    }

    tessel.subscribers.forEach(function (subscriber) {
      submitYo(subscriber);
    });

    console.log(tessel.subscribers);
    res.sendStatus(200);
  }
}

function create(req, res) {
  var doorbell = new Doorbell(req.body);

  doorbell.save(function (err, result) {
    if (err) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
  });
}

function submitYo(username) {
  request
    .post(api.url, {
        form: {
          username: username,
          api_token: api.token
        }
      },
      function (err, response) {
        console.log('sent yo to', username, 'and received', response.statusCode);
      }
  );
}
