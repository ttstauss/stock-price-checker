/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const axios = require('axios')
const mongoose = require('mongoose')

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

// connect to db
mongoose.connect(process.env.DB)

// set up mongoose schema & model
const Schema = mongoose.Schema

const stockSchema = new Schema({
  stock: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  ipAddresses: [{
    type: String
  }]
})

const Stock = mongoose.model('Stock', stockSchema)

// set up db functions
const createAndSaveStock = async (symbol, like, ipAddress, done) => {
  return new Promise(resolve => {
    Stock.findOne({stock: symbol}, (err, data) => {
      if(err) return resolve(done(err))

      if(!data) {
      const stock = new Stock({stock: symbol})
        if(like) {
          stock.likes++
          stock.ipAddresses.push(ipAddress)
        }
        stock.save((err, data) => {
          if(err) return resolve(done(err))
          return resolve(done(null, data))
        })
      } else {
        if(like) {
          if(!data.ipAddresses.includes(ipAddress)) {
            data.likes++
            data.ipAddresses.push(ipAddress)
            data.save((err, data) => {
              if(err) return resolve(done(err))
              return resolve(done(null, data))
            })
          } else {
            return resolve(done(null, data))
          }
        } else {
          return resolve(done(null, data))
        }
      }
    })
  })
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
    
      const stocks = req.query.stock
      const like = req.query.like
      const ipAddress = req.header('x-forwarded-for').split(',')[0] || req.connection.remoteAddress
      
      return axios.get(`https://api.iextrading.com/1.0/stock/market/batch?symbols=${stocks}&types=quote`)
                  .then(function(response) {

                    if(Object.keys(response.data).length > 1) {
                      const stockData = { "stockData": [] }
                      const promises = []

                      for (let prop in response.data) {
                        promises.push(
                          createAndSaveStock(prop, like, ipAddress, (err, data) => {
                            stockData.stockData.push({
                              "stock": prop.toUpperCase(),
                              "price": response.data[prop].quote.close,
                              "likes": data.likes
                            })
                          })
                        )
                      }

                      Promise.all(promises)
                             .then(() => {
                               if(stockData.stockData.length === 2) {
                                 stockData.stockData[0].rel_likes = stockData.stockData[0].likes - stockData.stockData[1].likes
                                 stockData.stockData[1].rel_likes = stockData.stockData[1].likes - stockData.stockData[0].likes
                                 delete stockData.stockData[0].likes
                                 delete stockData.stockData[1].likes
                                 res.json(stockData)
                               } else {
                                 res.json(stockData)
                               }
                             })
                             .catch(error => {
                               res.json(error)
                             })
                     } else {
                       const stockSymbol = Object.keys(response.data)[0]

                       createAndSaveStock(stockSymbol, like, ipAddress, (err, data) => {
                         res.json({"stockData": {
                           "stock": stockSymbol.toUpperCase(),
                           "price": response.data[stockSymbol].quote.close,
                           "likes": data.likes
                         }})
                       })

                     }
                   })
                   .catch(function(error) {
                     console.log(error.response.data)
                   })
    });
    
};
