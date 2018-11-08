var Table = require('./Table')
var db    = require('../../db')

module.exports = class Comment extends Table{
  constructor(){
    super()
    this.table_name = 'comment_table'
    this.fields = {
      comment_id:    {type: 'serial', constraints: ['NOT NULL', 'UNIQUE', 'PRIMARY KEY']},
      comment_order: {type: 'integer', constraints: ['NOT NULL', 'UNIQUE']},
      comment_string:{type: 'varchar(255)', constraints: ['NOT NULL']},
      chat_room_id:  {type: 'integer', constraints: ['FOREIGN KEY'], references: 'chat_room_table(chat_room_id)'}
    }
  }
}
