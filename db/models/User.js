
var Table = require('./Table')
var db    = require('../../db')

class User extends Table{
  constructor(){
    super()
    this.table_name = 'user_table'
    this.fields = {
      user_id    :  {type: 'serial', constraints: ['NOT NULL', 'UNIQUE', 'PRIMARY KEY']},
      username   : {type: 'varchar(255)', constraints: ['NOT NULL','DEFAULT \'default\'']},
      first_name : {type: 'varchar(255)', constraints: ['NOT NULL','DEFAULT \'default\''] },
      last_name  : {type: 'varchar(255)', constraints: ['NOT NULL','DEFAULT \'default\'']},
      password   : {type: 'varchar(255)', constraints: ['NOT NULL','DEFAULT \'default\'']},
      email      : {type: 'varchar(255)', constraints: ['NOT NULL','DEFAULT \'default\'']},
      created_on : {type: 'varchar(255)', constraints: []}
    }
  }

  async get_user_id( username ){
    try{
      var result = await db.query('SELECT * FROM USER_TABLE WHERE username = $1', [username])
      return result
    }catch(e){
      return e
    }
  }

  async get_user_information( username ){
    try{
      var result = await db.query('SELECT * FROM USER_TABLE WHERE username= $1;', [ username ]);
      return result;
    }catch(e){
      return e;
    }
  }

  async get_user_by_username( username ){
    try{
      var result = await db.query('SELECT * FROM USER_TABLE WHERE username = $1', [username])
      return result;
    }catch(e){
      console.log('error occured')
      return e
    }
  }

  async check_username_password(username, password){
    try{
      var query = 'SELECT EXISTS(SELECT * FROM USER_TABLE WHERE username=$1 and password=$2)'
      var result = await db.query(query, [username,password])

      return result
    }catch(e){
      console.log('error occured')
      return e
    }
  }

  async create_user(application_fields){
    /* i know i should be encrypting password but i want to get app done quickly */
    try{
      var query = 'INSERT INTO USER_TABLE(username, first_name, last_name, password, email) VALUES ($1,$2,$3,$4,$5);'
      var result = await db.query(query, [application_fields.username,
                                          application_fields.first_name,
                                          application_fields.last_name,
                                          application_fields.password,
                                          application_fields.email])
      return true
    }catch(e){
      console.log('could not create user')
      console.log(e)
      return false
    }


  }
}

module.exports = User
