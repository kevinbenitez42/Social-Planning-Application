const { Pool } = require('pg')

pool_config = {
  host: 'localhost',
  user: 'postgres',
  database: 'Planning App',
  max: 20,
  port: 5432,
  password: 'my_secret'
}

pool = new Pool( pool_config )

module.exports = {
  query : (text, params) => pool.query(text, params),
  get_client: (callback) => {
    pool.connect((err, client, done) => {
      callback(err, client, done)
    })
  },
  create_database: () =>{

  }

}
