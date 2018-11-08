import '../css/login.css'
require("@babel/polyfill");
import '../css/animate.css'

class LoginPage extends React.Component{
  constructor(props){
    super(props);
    this.state ={
      isApplying: false,
    }
    this.setApply = this.setApply.bind(this)
  }
  
  setApply(){
    var bool = this.state.isApplying
    this.setState({
      isApplying: !bool
    })
  }

  render(){
    var applying = !this.state.isApplying;
    return(
      <div>
      {applying ? (
        <LoginForm setApply={this.setApply}/>
      ) : (
        <ApplicationForm setApply={this.setApply}/>
      )
      }
    </div>
    )
  }
}


class ApplicationForm extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      first_name: '',
      last_name: '',
      username: '',
      password: '',
      email: ''
    }
    this.handleApply = this.handleApply.bind(this)
    this.handleChange= this.handleChange.bind(this)
  }

  async handleApply(e){
    e.preventDefault()
    var data  = await fetch('http://localhost:3000/login/apply',{
      method: 'POST',
      /* im doing this because we might not want to send the
      entire state to the server*/
      headers : new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        first_name: this.state.first_name,
        last_name : this.state.last_name,
        username  : this.state.username,
        password  : this.state.password,
        re_enter_password  : this.state.re_enter_password,
        email     : this.state.email
      }),
      redirect: 'follow'
  })

  if(data.status === 401){
    console.log('hey application form is invalid')
  }
  else{
    window.open(data.url)
  }
}

  handleChange(e){
    e.preventDefault()
    this.setState({
      [e.target.name] : e.target.value
    })
  }

  render(){
    return (
    <form onSubmit={this.apply} id="application_form">
      <label>
        <p>First Name: </p>
        <input onChange={this.handleChange} type="text" name="first_name"/>
      </label>

      <label>
        <p>Last Name: </p>
        <input onChange={this.handleChange} type="text" name="first_name"/>
      </label>

      <label>
        <p>User-name: </p>
        <input onChange={this.handleChange} type="text" name="username"/>
      </label>

      <label>
        <p>Password:</p>
        <input onChange={this.handleChange} type="text" name="password"/>
      </label>

      <label>
        <p>Re-enter Password: </p>
        <input onChange={this.handleChange} type="text" name="re_enter_password"/>
      </label>

      <label>
        <p>Email: </p>
        <input onChange={this.handleChange} type="text" name="email"/>
      </label>

      <label>
        <input onClick={this.handleApply} type="submit" name="submit"/>
      </label>

{/*
      <label>
        <p>Last name: </p>
        <input onChange=this.handleChange type="text" name="last_name" />
      </label>

      <input type="submit" value="Submit Application"/>

*/}
</form>
)
  }
}

const invalid_pop_style ={
  color    : 'red',
  fontSize : '15px',
  fontStyle: 'italic',
  marginLeft: '5px'
}

class LoginForm extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      username: '',
      password: '',
      isAuthorized: false
    }
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin  = this.handleLogin.bind(this);
        this.transitionAnimation = this.transitionAnimation.bind(this);
  }

  async authenticate(){
    var url = 'http://localhost:3000/login/authorize'
    var data = await fetch(url,{
      method: 'POST',
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
        'Content-Type': 'application/json',
         Pragma: 'no-cache',
        'Access-Control-Expose-Headers': 'Access-Token, Uid'
      }
      ,
      body: JSON.stringify({
        username : this.state.username,
        password : this.state.password
      }),
      redirect: "follow"
    })
    if(data.status === 401){
      console.log('not authorized try again')
      this.setState({isAuthorized: true})
    }
    else{
      console.log('authorized')
      this.setState({isAuthorized: false})
      window.open(data.url)
    }
  }

  handleChange(e){
   console.log( `${e.target.name} : ${e.target.value}`)
   this.setState({[e.target.name]: e.target.value});
 }

  handleLogin(e){
   e.preventDefault()
   this.authenticate()
  }

  transitionAnimation(){
     console.log(this.props)
     this.props.setApply()
  }

  render(){
    return (
      <div><form onSubmit={this.handleLogin} id="login_form">
      <label>
        <div>
          <p style={{display: 'inline-block', height:'20px'}}>Username</p>
          {!this.state.isAuthorized ?<span> </span> : <span className="animated fadeIn slow"style={invalid_pop_style}> username or password is incorrect </span>}
        </div>
        <input onChange={this.handleChange} type="text" name="username"/>
      </label>
      <label>
        <p>Password</p>
        <input onChange={this.handleChange} type="text" name="password" />
      </label>
      <input type="submit" value="login"/>
      <div className="animated pulse fast">
      <p onClick={this.transitionAnimation} className="apply"> Don't have an account? Sign up here!</p>
      </div>
    </form>
</div>
  )
  }
}

ReactDOM.render(
  <LoginPage/>,
  document.getElementById('root')
);
