var Table =  require('./Table')
var db    = require('../../db')

module.exports = class Plan extends Table {
  constructor(){
    super()
    this.table_name = 'plan_table'

    this.fields = {
      plan_id   :   {type: 'integer', constraints: ['NOT NULL', 'UNIQUE','PRIMARY KEY']},
      user_id   :   {type: 'integer', constraints: ['FOREIGN KEY'], references: 'user_table(user_id)'}
    }
  }

}
