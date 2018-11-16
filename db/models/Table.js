var db = require('../../db') // for readability

module.exports = class Table {
  constructor(){
    this.table_name = ''
    this.fields = {}
    this.primary_key  = ''
    this.foreign_keys = {}
  }
  /* after we are done adding columns that appear in
  homemade orm and does not appear in the database we
  add foreign keys, though I Should be adding columns within the add_columns
  function to be consistent. THIS SHOULD BE CHANGED */

  async add_foreign_keys(){
    var query1 = null
    var query2 = null
    for(let field of Object.keys(this.fields)){

      if(this.fields[field].constraints[0] === 'FOREIGN KEY'){
        query1 = `ALTER TABLE ${this.table_name} ADD COLUMN ${field} ${this.fields[field].type}`
        query2 = `ALTER TABLE ${this.table_name} ADD CONSTRAINT constraint_fk_${field} FOREIGN KEY (${field}) REFERENCES ${this.fields[field].references} ON DELETE CASCADE;`

    if(query1 === null || query2 === null){
      return
    }
    else{
      try{
        await db.query(query1)
      }catch(e){
      //  console.log(e)
      }finally{
        try{
          await db.query(query2)
        }
        catch(ex){
        //  console.log(ex)
        }
      }
    }
  }
}
  }
  /* Makes sure table exists if not create it it */
  async table_exists(){
    var query_string = `
       SELECT EXISTS (
         SELECT 1 from information_schema.tables
         WHERE table_name = $1)
         `
    try {
      var result = await db.query(query_string,[this.table_name] )
      return result.rows[0].exists
    }
    catch(e){
      return e
    }
  }
  /* convenice function for retrieving a databases fields */
  async retrieve_fields(){
    var query_string = `
    SELECT column_name From information_schema.columns
      WHERE table_name = $1
    `
    try {
      var result = await db.query(query_string,[this.table_name] )
      return result.rows
    }
    catch(e){
      //console.log(e)
      return e
    }
  }

  /*should have used sequelize :'( */
  async add_columns(){
    var database_fields = (await this.retrieve_fields()).map(x => x['column_name'])
    var orm_fields = Object.keys(this.fields)
    var inner = ''
    var isPresent = false
    var primary_key = null
    var foreign_key = null;

    for( let orm_field of orm_fields ){

      /*
        are database fields in orm? add ADD COLUMN
        column_name to query if so, otherwise do nothing
      */

      for( let database_field of database_fields){
        //console.log('database_field: ' + database_field)
        //console.log('orm_field: ' + orm_field)
        //console.log('\n')
        if(orm_field === database_field){
          isPresent = true
          break;
        }
        else{
          isPresent = false
        }
      }

      if(!isPresent){
         var constraints = '';
         this.fields[orm_field].constraints.map((constraint) =>{
           /*is foreign_key? skip it*/
           if(constraint === 'FOREIGN KEY'){
             //foreign_key = `ADD FOREIGN (${orm_field}) KEY REFERENCES (${this.fields[orm_field].references}) ON DELETE CASCADE ON UPDATE CASCADE `
           }
           /*
             is primary_key? create arguemnt and
             add to end of alter table query else
             add ADD COLUMN
           */
           else if(constraint !== 'PRIMARY KEY'){
             constraints = constraints + ' ' + constraint
           }
           else{
             primary_key = `ADD PRIMARY KEY(${orm_field})`
           }
         })
         if(this.fields[orm_field].constraints[0] !== 'FOREIGN KEY'){
         inner = inner + `ADD COLUMN ${orm_field} ${this.fields[orm_field].type}${constraints},\n`
       }
      }
    }

    if(primary_key !== null){
    inner = inner + primary_key + ',\n'
    }

    if(foreign_key !== null){
      inner = inner + foreign_key + ',\n'
    }
    /* clean up string */
    var query = `ALTER TABLE ${this.table_name} \n` + inner  +'\n'
    query = query.substring(0, query.length-3) + ';'

    /* add foreign_keys before adding missing columns */
    await this.add_foreign_keys()

    /*add missing columns, if all columns are present return null*/
    if( inner !== ''){
      try{
        console.log('update query: \n\n' + query + '\n')
        await db.query(query)
        return
      }
      catch(e){
        console.log(e)
        return e
      }
    }
    else{
      return null;
    }
  }

  async remove_columns(){
    var database_fields = (await this.retrieve_fields()).map(x => x['column_name'])
    var orm_fields = Object.keys(this.fields)
    var inner = ''
    var shouldDrop = true
    var primary_key = ''
    var foreign_key = null;

    for( let database_field of database_fields ){

      for( let orm_field of orm_fields){
        if(orm_field === database_field){
          shouldDrop = false
          break
        }
        else{
          shouldDrop = true
        }
      }
      if(shouldDrop){
         inner = inner + `DROP COLUMN ${database_field},\n`
      }
    }
    var query = `ALTER TABLE ${this.table_name} \n` + inner  +'\n'
    query = query.substring(0, query.length-3) + ';'
    if( inner !== ''){
      try{
        console.log(this.table_name + ' removal query: \n\n' + query + '\n')
        return await db.query(query)
      }
      catch(e){
        console.log(e)
        return e
      }
    }
    else{

      return null;
    }
  }

  async create_table(){
    var exists = (await this.table_exists())
    if(exists !== true){
      console.log('table  does  not exist')
      const table_def = this.create_table_string()
      try{
        var result = await db.query(table_def);
        return result;
      }catch(e){
        console.log(table_def)
        console.log(e)
        return e;
      }
    }
    else{
        console.log('table exists!!... updating: ' + this.table_name)
        this.add_columns()
        this.remove_columns()
    }
  }

  create_table_string(){
    var fields_ = Object.keys(this.fields)
    var inner = '';
    for (let field of fields_){

      inner = inner + field + ' ' + this.fields[field].type
      for (let constraint of this.fields[field].constraints){
        if(!(constraint === 'FOREIGN KEY' || constraint === 'PRIMARY KEY')){
          inner = inner + ' ' + constraint
        }
      }
      inner = inner + ",\n"
    }

    var str = `CREATE TABLE ${this.table_name}(` + inner +')'
    str = str.substring(0, str.length-3) +')'
    return str
  }
}
