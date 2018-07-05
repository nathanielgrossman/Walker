const { Pool, Client } = require('pg')

const connectionString = require('./../keys').connectionString;

const pool = new Pool({
  connectionString: connectionString
});


module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
}