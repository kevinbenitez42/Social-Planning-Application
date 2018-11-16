var Table =  require('./Table')
var db    = require('../../db')

module.exports = class IdeaBox extends Table {
  constructor(){
    super()
    this.table_name = 'idea_box_table'

    this.fields = {
      idea_string:   {type: 'varchar(255)', constraints: ['NOT NULL']},
      idea_box_id:   {type: 'serial', constraints:   ['NOT NULL', 'UNIQUE']},
      user_id   :    {type: 'integer' , constraints: ['FOREIGN KEY'], references: 'user_table(user_id)'},
      chat_room_id:  {type: 'serial',   constraints: ['FOREIGN KEY'], references: 'chat_room_table(chat_room_id)'},
      vote_count  :  {type: 'integer', constraints:   ['NOT NULL']}
    }
  }

}
