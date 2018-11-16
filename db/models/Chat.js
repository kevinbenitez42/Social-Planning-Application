var Table =  require('./Table')
var db    = require('../../db')

module.exports = class Chat extends Table {
  constructor(){
    super()
    this.table_name = 'chat_room_table'

    this.fields = {
      chat_room_id   :   {type: 'integer', constraints:      ['NOT NULL', 'UNIQUE','PRIMARY KEY']},
      chat_room_name :   {type: 'varchar(255)', constraints: ['NOT NULL']},
      voting_style   :   {type: 'varchar(255)', constraints: ['NOT NULL']},
    }
  }

}
