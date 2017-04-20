const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const {DATABASE_URL, PORT} = require('./config');
const {RunLog, User} = require('./models');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());
passport.use(LocalStrategy);
app.use(passport.initialize());

mongoose.Promise = global.Promise;

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
      mood: req.body.mood,
      notes: req.body.notes
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
    .then(updatedPost => res.status(200).json(updatedPost.apiRepr()))
    .catch(err => res.status(500).json({message: 'Unable to update'}));
});



// const strategy = new LocalStrategy(
//   (username, password, cb) => {
//     User
//       .findOne({username})
//       .exec()
//       .then(user => {
//         if (!user) {
//           return cb(null, false, {
//             message: 'Incorrect username'
//           });
//         }
//         if (user.password !== password) {
//           return cb(null, false, 'Incorrect password');
//         }
//         return cb(null, user);
//       })
//       .catch(err => cb(err))
// });
console.log("code hit");
app.post('/login', (req, res) => {
  
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field: username'});
  }

  let {username, password} = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
  }

  username = username.trim();

  if (username === '') {
    return res.status(422).json({message: 'Incorrect field length: username'});
  }

  if (!(password)) {
    return res.status(422).json({message: 'Missing field: password'});
  }

  if (typeof password !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: password'});
  }

  password = password.trim();

  if (password === '') {
    return res.status(422).json({message: 'Incorrect field length: password'});
  }

  // check for existing user
  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'username already taken'});
      }
      // if no existing user, hash password
      return User.hashPassword(password)
    })
    .then(hash => {
      return User
        .create({
          username: username,
          password: hash
        })
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      res.status(500).json({message: 'Internal server error'})
    });
});

app.get('/', (req, res) => {
  return User
    .find()
    .exec()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});


passport.use = new LocalStrategy(function(username, password, callback) {
  let user;
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, false, {message: 'Incorrect password'});
      }
      else {
        return callback(null, user)
      }
    });
});


app.get('/me',
  passport.authenticate('basic', {session: false}),
  (req, res) => res.json({user: req.user.apiRepr()})
);

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
