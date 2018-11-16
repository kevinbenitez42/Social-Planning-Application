var Table =  require('./Table')
var db    =  require('../../db')

module.exports = class Responsible extends Table {
  constructor(){
    super()
    this.table_name = 'responsible_table'

    this.fields = {
      user_id       :   {type: 'integer', constraints: ['FOREIGN KEY'], references: 'user_table(user_id)'},
      plan_id       :   {type: 'integer', constraints: ['FOREIGN KEY'], references: 'plan_table(plan_id)'},
      idea_box_id   :   {type: 'integer', constraints: ['FOREIGN KEY'], references: 'idea_box_table(idea_box_id)'}
    }
  }

}
