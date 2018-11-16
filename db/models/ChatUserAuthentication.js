var Table =  require('./Table')
var db    = require('../../db')

module.exports = class ChatUserAuthentication extends Table {
  constructor(){
    super()
    this.table_name = 'chat_user_authentication_table'

    this.fields = {
     is_master    :   {type: 'boolean', constraints: ['NOT NULL', 'UNIQUE']},
     user_id      :   {type: 'integer', constraints: ['FOREIGN KEY'], references: 'user_table(user_id)'},
     chat_room_id :   {type: 'integer', constraints: ['FOREIGN KEY'], references: 'chat_room_table(chat_room_id)'}
    }
    
  }

}
