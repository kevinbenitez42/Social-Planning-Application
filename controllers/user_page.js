/* The user page responsible for providing the buisness logic of the Application */
var router = require('express-promise-router')();
var passport = require('passport')
var cookieParser = require('cookie-parser')
var passport = require('passport');
var User = require('../db/models/User')
user_table = new User()
/*main user_route route*/
router.get('/', (req,res,next)=>{

  if(!req.user){
    res.render('invalid.html')
  }
  res.render('user_page.html');
})

router.get('/getUserName',cookieParser(),(req,res,next)=>{
  res.send({user: req.user})
})

router.get('/getUserInformation', cookieParser(),async (req,res,next)=>{
  var userInformation = (await user_table.get_user_information(req.user)).rows[0]
  delete userInformation.password
  res.send({userInformation: userInformation})
})

router.post('/createChatRoom', async(req, res, next) =>{
  console.log(req.body);
})
module.exports = router;
