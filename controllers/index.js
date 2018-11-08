var router = require('express').Router();

router.use('/login'    ,require('./login'))
router.use('/user_page',require('./user_page'))

router.get('/', (req, res, next) => {
  if(req.user){
    res.render('user_page.html')
  }
  res.render('login.html')
})

module.exports = router
