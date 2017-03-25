const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const {DATABASE_URL, PORT} = require('./config');
const {RunLog} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

// get

app.get('/log', (req, res) => {
  RunLog
    .find()
    .exec()
    .then(logs => {
      res.json(logs.map(log => log.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Unable to find log'});
    });
});

app.post('/log', (req, res) => {
  const requiredFields = ['date', 'time', 'distance', 'location', 'weather', 'mood'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  RunLog
    .create({
      date: req.body.date,
      time: req.body.time,
      distance: req.body.distance,
      location: req.body.location,
      weather: req.body.weather,
      mood: req.body.mood
    })
    .then(RunLog => res.status(201).json(RunLog.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Unable to Create Log'});
    });

});


app.delete('/log/:id', (req, res) => {
  RunLog
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      res.status(204).json({message: 'Run deleted'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Unable to delete run'});
    });
});


app.put('/log/:id', (req, res) => {
  
  const updated = {};
  const updateableFields = ['date', 'time', 'distance', 'location', 'weather', 'mood'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  RunLog
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedPost => res.status(201).json(updatedPost.apiRepr()))
    .catch(err => res.status(500).json({message: 'Unable to update'}));
});


let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};
