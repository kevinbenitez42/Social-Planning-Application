var Table =  require('./Table')
var db    = require('../../db')

module.exports = class IdeaBox_Plan extends Table {
  constructor(){
    super()
    this.table_name = 'idea_box_plan_table'

    this.fields = {
      plan_id       :   {type: 'integer', constraints: ['FOREIGN KEY'], references: 'plan_table(plan_id)'},
      idea_box_id   :   {type: 'integer', constraints: ['FOREIGN KEY'], references: 'idea_box_table(idea_box_id)'}
    }
  }

}
