import '../css/user_page.css'
require("@babel/polyfill");

function Chat_Bubble( props ){
  return (
     props.owner.isSender ?
       <div id="chat_bubble_internal">
          <p> {props.text} </p>
        </div>
      : <div id="chat_bubble_external">
          <p> {props.text} </p>
        </div>

  )
}

class Idea extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      isClosed: false,
      totalVoteCount: 0,
      singleVoteCount: 0
    }
    this.delete    = this.delete.bind(this)
    this.vote_up   = this.vote_up.bind(this)
    this.vote_down =this.vote_down.bind(this)
  }

  delete(e){
    this.props.deleteOperation(this.props.key_)
  }

  vote_up(e){
    if(this.state.singleVoteCount < 1){
    var key = this.props.key_
    var value = this.props.vote(key, true)
    this.setState({
      totalVoteCount: value,
      singleVoteCount: this.state.singleVoteCount + 1
    })
  }
  }

  vote_down(e){
    if((this.state.singleVoteCount > -1)){
    var key =this.props.key_
    var value = this.props.vote(key, false)
    this.setState({
      totalVoteCount: value,
      singleVoteCount: this.state.singleVoteCount - 1
    })
  }
  }

  render(){
    return (
      <div id='idea'>
      <i onClick={this.delete} className="fas fa-times red"></i>
      <div id="vote_arrows">
         <i onClick={this.vote_up} className="fas fa-chevron-up" style={{ color: "grey"}}></i>
         { this.state.totalVoteCount }
         <i onClick={this.vote_down} className="fas fa-chevron-down" style={{ color: "grey"}}></i>
      </div>
      <p>
          {this.props.text}
      </p>
      </div>
    )
  }
}

class UserPage extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      exitModal       : true,
      chat_room_submit: false,
      chat_room_created: false,
      users_to_add_to_chat: new Set(),
      user_information: {},
      users_online    : new Map(),
      users_online_arr: [],
      socket          : null,
      counter         : 0,
      user_id         : null,
      isMaster        : null,
      menuOpen        : false,
      chatRoomOn      : 0,
      user_chat_rooms : [],
      chat_bubbles    : [],
      voteCounts      : new Map(),
      ideas           : [],
      finalized       : []
    }
    //holy hell!!! thats a lot of binding should probably use arrow functions
    this.toggleModal       = this.toggleModal.bind(this)
    this.getUserInformation= this.getUserInformation.bind(this)
    this.users_online_arr  = this.users_online_arr.bind(this)
    this.chat_room_clicked = this.chat_room_clicked.bind(this)
    this.openMenu          = this.openMenu.bind(this)
    this.submitText        = this.submitText.bind(this)
    this.submitIdea        = this.submitIdea.bind(this)
    this.vote              = this.vote.bind(this)
    this.delete            = this.delete.bind(this)
    this.getVoteCount      = this.getVoteCount.bind(this)
    this.prepareSocket     = this.prepareSocket.bind(this)
    this.receiveText       = this.receiveText.bind(this)
    this.addUserToChatRoom = this.addUserToChatRoom.bind(this)
    this.createChatRoom    = this.createChatRoom.bind(this)
  }

  toggleModal(){
    if(this.state.toggleModal === false){
      this.state.chat_room_submit = false;
    }
    this.setState({
      toggleModal : !this.state.toggleModal,
      chat_room_submit : this.state.chat_room_submit
    })
  }

  componentDidMount(){
    this.getUserInformation()
    this.prepareSocket()
  }

  async getUserInformation(){

    var data = await (await fetch('http://localhost:3000/user_page/getUserInformation',{
      method: 'GET',
      mode:'cors',
      headers : new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: 'include'
    })).json()
    this.setState({user_information: data.userInformation})
  }

  async prepareSocket(){

    var _data = await (await fetch('http://localhost:3000/user_page/getUserName',{
      mode: 'cors',
      method :'GET',
      headers : new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: 'include'
    })).json()

    this.state.socket = io({query: `name=${_data.user}`})

    this.state.socket.on('user_connected', (data)=>{

      if(this.state.users_online_arr.indexOf(data.user) >= 0){
        console.log('user is already online')
      }
      else{
        if(data.user !== this.state.user_information.username){
          this.state.users_online.set(data.user, <li> <a id={data.user} href="#" > {data.user} </a> </li>)
          var users_online_arr = Array.from(this.state.users_online_arr)
          users_online_arr.unshift(data.user)
          this.setState({users_online_arr: users_online_arr})
          this.setState({users_online:this.state.users_online})
        }
      }

     this.state.socket.emit('recieved_update', {success: true})
    })

    this.state.socket.on('user_disconnected',(data)=>{
      this.state.users_online.delete(data.user)
      var newArray = []
      for(let user of this.state.users_online_arr){
        if(data.user !== user){
          newArray.push(user)
        }
      }
      this.setState({
        users_online: this.state.users_online,
        users_online_arr: newArray
      })
    })

    this.state.socket.on('chat_message',(data)=>{
      this.receiveText(data)
    })

    this.state.socket.on('update_users',(data)=>{
      var users_connected = Object.keys(data)
      var userExists = false
      var users_online_arr = Array.from(this.state.users_online_arr)
      users_online_arr.push()

      console.log('before')
      console.log(this.state.users_online_arr)
      for(let key of users_connected){
        for(let user of this.state.users_online_arr){
          if(user === key ){
            userExists = true
          }
        }
        if(!userExists && key !== this.state.user_information.username){
          users_online_arr.push(key)
          this.state.users_online.set(key, <li> <a id={key} href="#" > {key} </a> </li>)
        }
        userExists = false;
      }
      console.log('after')
      console.log(users_online_arr)
      this.setState({
        users_online_arr : users_online_arr,
        users_online: this.state.users_online
      })
    })


    this.setState({
      socket : this.state.socket
    })
  }

  vote(key, shouldAdd){
    for(let idea of this.state.ideas){
      if(idea.key === key){
        let val = this.state.voteCounts.get(key)
        if(val !== undefined || val !== null){
          shouldAdd ? (val = val + 1) : (val = val - 1)
          this.state.voteCounts.set(key,val);
          this.setState({voteCounts: this.state.voteCounts})
          return val
        }
        else{
          console.log('hey value is not defined for given key')
        }
      }
    }
  }

  getVoteCount(key){
    return this.state.voteCounts.get(key)
  }

  chat_room_clicked(e){
    this.setState({
      chatRoomOn : e.event.id
    })
  }

  openMenu(){
    this.setState({
      menuOpen: !this.state.menuOpen
    }
  )
}

submitText(e){
  if(e.key === 'Enter'){
    console.log('message was sent')
    var user_information = this.state.user_information
    user_information.message = e.target.value
    this.state.socket.emit('chat_message', user_information )
    var owner = {user : this.state.user_information.username, isSender: true}
    this.state.chat_bubbles.unshift(<Chat_Bubble owner={owner} key={e.target.value} text={e.target.value}/>)
    this.setState({
      chat_bubbles: this.state.chat_bubbles
    })
  }
}

receiveText(external_information){
  console.log('recieve text cool')
  console.log(this.state.user_information.username)
  console.log(external_information.username)

  if(this.state.user_information.username !== external_information.username){
    var owner = {user: external_information.username, isSender: false}
    this.state.chat_bubbles.unshift(<Chat_Bubble owner={owner} key={external_information.message} text={external_information.message}/>)
    this.setState({
      chat_bubbles: this.state.chat_bubbles
    })
  }
}

delete(key){
  var updateIdeas = []
  var updateVoteCount = []
  for(let idea_ of this.state.ideas){
    if(idea_.key !== key){
      updateIdeas.push(idea_)
    }
    else{
      this.state.voteCounts.delete(key)
      console.log('deleted')
    }
  }
  this.setState({ideas: updateIdeas})
}


submitIdea(e){
  var field = e.target.value
  var newKey = this.state.counter + 1;
  this.setState({counter:newKey})

  if(e.key === 'Enter'){
    this.state.voteCounts.set(newKey, 0)
    console.log(this.state.voteCounts)
    this.state.ideas.unshift({
      key           : newKey,
      shouldDelete  : false,
      idea          : <Idea voteCount={this.state.voteCounts.get(newKey)}
        getVoteCount= {this.getVoteCount}
        vote={this.vote}
        deleteOperation={this.delete}
        key_={newKey}
        key={newKey}
        text={field}/>,
        shouldMove    : false,
        masterOverride: false
      })

      this.setState({
        ideas: this.state.ideas,
        voteCounts :this.state.voteCounts
      })
    }
  }

  users_online_arr(){
    var arr = []
    for(let user of this.state.users_online){
      arr.unshift(user[1])
    }
    return arr
  }

  async createChatRoom(e){
    e.preventDefault();
    var data = this.state.users_to_add_to_chat.entries()
    var body = {
      users : data
    }
    this.state.exitModal = false
    this.setState({exitModal : this.state.exitModal })
    /*
    var response = await fetch('http://localhost:3000/user_page/createChatRoom',{
      method: 'POST',
      headers: {
        "Content-Type": 'application/json'
      },
      body: {JSON.stringify(body)}
      credentials: 'include'
    })
    */
    var response = {ok: true, status: 201}
    if(response.ok){
      let chatRoomCreated = false
      if( response.status === 201){
        chatRoomCreated = true;
        console.log('your chat room has been created')
      }
      this.setState({
        chat_room_created: chatRoomCreated,
        chat_room_submit: true,
      })
      this.state.exitModal = true
      this.setState({exitModal : this.state.exitModal })
    }
    else{
      'error with response :('
    }
  }

  addUserToChatRoom(e){
      console.log(e.target.value)
      this.state.users_to_add_to_chat.add(e.target.value)
  }
  render(){
    var side_menu_state = this.state.menuOpen ? { width: '200px'} : {width: '0px'}
    var users_online = Array.from(this.state.users_online_arr)
    return (

      <div className="UserPage">

        {
          this.state.toggleModal &&
          <div id="addRoomModal">
            <div onClick={this.toggleModal} id="background"></div>
            <form onSubmit={this.createChatRoom} id="addRoomForm">
              <label style={{display : "block"}}>
                <input style={{display : "block"}}/>
              </label>
              {
                users_online.map(user =>{
                  return(
                    <label style={{display : "block"}}>
                      <input onChange={this.addUserToChatRoom} type="checkbox" value={user}/> {user}
                    </label>
                  )
                })
              }
            </form>
          </div>
        }

        {
          this.state.chat_room_submit && <div style={{
            position: 'absolute',
            top:      '50%',
            left:     '50%'
          }}>
          <h1>
            {
              this.state.chatRoomCreated ? "CHAT ROOM CREATED!!!" : "chat room not created"
            }
          </h1>
        </div>
      }


        <div style={side_menu_state} id='side_menu'>
          { this.state.menuOpen ? <i onClick={this.openMenu} class="fas fa-times"></i> : <i onClick={this.openMenu} class="fas fa-bars"></i> }

          <div>
            users online
          </div>

          <ul>
            {this.users_online_arr()}
          </ul>

          <div>
            chat rooms
              <i onClick={this.toggleModal}class="fas fa-plus"></i>
          </div>

          {this.state.user_chat_rooms}
        </div>

        <div id="chat">
          <div id="chat_window">
            {this.state.chat_bubbles}
          </div>
          <textarea onKeyPress={this.submitText} id="text_in"/>
        </div>

        <div id="idea_box">
          <div id="idea_window">
            {this.state.ideas.map((x) => x.idea)}
          </div>
          <textarea onKeyPress={this.submitIdea} id="idea_text_area"/>
        </div>
        <div id="plan"></div>
      </div>
    )
  }
}

ReactDOM.render(
  <UserPage/>,
  document.getElementById('root')
);
