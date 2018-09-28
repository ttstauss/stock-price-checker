/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite(`GET /api/stock-prices => stockData object
           NOTE - clear GOOG from db before running tests
          `, function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', '127.0.0.1')
        .query({stock: 'goog'})
        .then(function(res){
          assert.equal(res.status, 200)
          assert.isObject(res.body)
          assert.deepNestedPropertyVal(res.body, 'stockData.stock', 'GOOG')
          assert.deepNestedPropertyVal(res.body, 'stockData.likes', 0)
          assert.nestedProperty(res.body, 'stockData.price')
          done();
        })
        .catch(function(err){
          throw err
        })
      })
      
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', '127.0.0.1')
        .query({stock: 'goog', like: true})
        .then(function(res){
          assert.equal(res.status, 200)
          assert.isObject(res.body)
          assert.deepNestedPropertyVal(res.body, 'stockData.stock', 'GOOG')
          assert.deepNestedPropertyVal(res.body, 'stockData.likes', 1)
          assert.nestedProperty(res.body, 'stockData.price')
          done();
        })
        .catch(function(err){
          throw err
        })
      })
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', '127.0.0.1')
        .query({stock: 'goog', like: true})
        .then(function(res){
          assert.equal(res.status, 200)
          assert.isObject(res.body)
          assert.deepNestedPropertyVal(res.body, 'stockData.stock', 'GOOG')
          assert.deepNestedPropertyVal(res.body, 'stockData.likes', 1)
          assert.nestedProperty(res.body, 'stockData.price')
          done();
        })
        .catch(function(err){
          throw err
        })
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .set('x-forwarded-for', '127.0.0.1')
          .query({stock: ['googl', 'aapl']})
          .then(function(res){
            assert.equal(res.status, 200)
            assert.isObject(res.body)
            assert.isArray(res.body.stockData)
            assert.lengthOf(res.body.stockData, 2)
            assert.deepNestedPropertyVal(res.body, 'stockData[0].stock', 'GOOGL')
            assert.nestedProperty(res.body, 'stockData[0].price')
            assert.deepNestedPropertyVal(res.body, 'stockData[0].rel_likes', 0)
            assert.deepNestedPropertyVal(res.body, 'stockData[1].stock', 'AAPL')
            assert.nestedProperty(res.body, 'stockData[1].price')
            assert.deepNestedPropertyVal(res.body, 'stockData[1].rel_likes', 0)
            done();
          })
          .catch(function(err){
            throw err
          })
      })
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', '127.0.0.1')
        .query({stock: ['googl', 'aapl'], like: true})
        .then(function(res){
          assert.equal(res.status, 200)
          assert.equal(res.status, 200)
          assert.isObject(res.body)
          assert.isArray(res.body.stockData)
          assert.lengthOf(res.body.stockData, 2)
          assert.deepNestedPropertyVal(res.body, 'stockData[0].stock', 'GOOGL')
          assert.nestedProperty(res.body, 'stockData[0].price')
          assert.deepNestedPropertyVal(res.body, 'stockData[0].rel_likes', 0)
          assert.deepNestedPropertyVal(res.body, 'stockData[1].stock', 'AAPL')
          assert.nestedProperty(res.body, 'stockData[1].price')
          assert.deepNestedPropertyVal(res.body, 'stockData[1].rel_likes', 0)
          done()
        })
        .catch(function(err){
          throw err
        })
      })
      
    });

});
