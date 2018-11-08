/* The login router responsible for user authentication */
var router = require('express-promise-router')();
var passport = require('passport');
var axios = require('axios');
var bodyParser = require('body-parser')
var path = require('path')
var USER_TABLE = require('../db/models/User')
var user_table = new USER_TABLE()

/*entry for our login page*/
router.get('/', (req,res,next)=>{
  if(req.user){
    res.render('user_page.html')
  }
  res.render('login.html')
})

/*the process we use to authenticate and redirect users to main application page */
router.post('/authorize', passport.authenticate('local'), async (req, res ,next) =>{
  res.status(302);
  res.redirect('/user_page')
})

/* route for validating user application form an creating new users */
router.post('/apply',  async (req, res, next) =>{
  application_fields = req.body
  if (application_fields['password'] !== application_fields['re_enter_password'] ){
    res.status('401')
    res.send('passwords are not the same')
  }
  var result = await user_table.get_user_by_username( application_fields.username )
  if(result.rowCount === 0){
    var result = await user_table.create_user( application_fields)

    if(result){
      console.log('user creation successful')
    }
    else{
      console.log('error, no duplicate emails')
    }
  }
  else{
    console.log('user exists!!')
  }

  res.redirect('http://localhost:3000/login')
}
)
module.exports = router;
