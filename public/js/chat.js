const socket=io()
//Templates
const $messageForm=document.querySelector('#message-form')
const $messageInput=document.querySelector('#message-form #message-input')
const $messageButton=document.querySelector('#message-form #message-send-button')
const $locationButton=document.querySelector('#geo-location')
const $messages=document.querySelector('#messages')
//Messages
const $messageTemplate=document.querySelector('#template-message').innerHTML
const $locationTemplate=document.querySelector('#location-template').innerHTML
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//Parameters(name of user and room)
const {name,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll=()=>{
    //new message element
    $newMessage=$messages.lastElementChild
    //height of new message
    const newMessageStyle=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    //how far have i scroll down

    const scrollOfset=$messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOfset){
        $messages.scrollTop=$messages.scrollHeight
    }
    console.log(newMessageMargin)
}
//kanal koji osluskuje welcome message i prikazuje ga korisniku
//koji je pristupio chat-u
socket.on('welcomeMessage',(messageJoin)=>{
    console.log(messageJoin.text)
    const html=Mustache.render($messageTemplate,{
        message:messageJoin.text,
        createdAt:moment(messageJoin.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    
})

//kanal koji osluskuje da li je neko od ucesnika uputio  neku novu poruku
socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
//kanal koji osluskuje da li je neko napustio chat
socket.on('leaveChat',(messageLeave)=>{
    const html=Mustache.render($messageTemplate,{
        message:messageLeave.text
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    let message=$messageInput.value
    $messageButton.setAttribute('disabled','disabled')
    socket.emit('sendMessage',message,(error)=>{

        $messageButton.removeAttribute('disabled')
        $messageInput.value=''
        $messageInput.focus()
        if(error){
            console.log(error)
            return
        }
        console.log('The message was delivered')

    })
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        alert('Your browser not suppport geolocation')
    }
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $locationButton.removeAttribute('disabled')
            console.log('The location has been shared')
        })
    })
})
socket.on('receivedMessage',(message)=>{
    console.log(message.text)
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('shareClientLocation',(location)=>{
    console.log(location)
    const html=Mustache.render($locationTemplate,{
        username:location.username,
        location:location.locationLink,
        createdAt:moment(location.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.emit('join',{name,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
socket.on('roomData',({room,users})=>{
    console.log(users)
    console.log(room)
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('.chat__sidebar').innerHTML=html
})