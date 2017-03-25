const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();


chai.use(chaiHttp);

describe('RunLog', function() {

  before(function() {
    return runServer();
  });

    after(function() {
    return closeServer();
  });

  it('should list items on GET', function() {
   
    return chai.request(app)
      .get('/log')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);
        const expectedKeys = ['id', 'date', 'time', 'distance', 'location', 'weather', 'mood'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  it('should add an item on POST', function() {
    const newItem = {
      date: '03/25/17', 
      time: '45 mins',
      distance: '4 miles',
      location: 'open space',
      weather: 'cloudy',
      mood: 'tired'
    };

    return chai.request(app)
      .post('/log')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'date', 'time', 'distance', 'location', 'weather', 'mood');
        res.body.id.should.not.be.null;
        res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id, date: res.body.date}));
      });
  });

  it('should update items on PUT', function() {
    const updateData = {
      time: '30 mins',
      distance: '3 miles',
      location: 'south platte river',
      weather: 'sunny',
      mood: 'excited'
    };

    return chai.request(app)
      .get('/log')
      .then(function(res) {
        updateData.id = res.body[0].id;
        updateData.date = res.body[0].date;
        return chai.request(app)
          .put(`/log/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal(updateData);
      });
  });

  it('should delete items on DELETE', function() {
    return chai.request(app)
      .get('/log')
      .then(function(res) {
        return chai.request(app)
          .delete(`/log/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});