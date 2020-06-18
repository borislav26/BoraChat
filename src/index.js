const {generate,generateLocationMessage}=require('./utils/messages.js')
const {findUser,removeUser,addUser,listOfUsersByRoom}=require('./utils/users')
const http=require('http')
const path=require('path')
const socketio=require('socket.io')
const express=require('express')
const Filter=require('bad-words')
const app=express()
const server=http.createServer(app)
const io=socketio(server)
const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket)=>{
    console.log('new websocket connection')

    socket.on('join',({name,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username:name,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)


            //kanal koji salje poruku svakom klijentu koji se prikljuci konverzaciji
    socket.emit('welcomeMessage',generate(user.username,`Welcome ${user.username}`))

    //kanal koji obavestava sve user-e osim onog koji je pristupio
    //cetu da je novi user prikljucen
    socket.broadcast.to(user.room).emit('message',generate(`${user.username} has joined!`))
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:listOfUsersByRoom(user.room)
    })
    callback()
    })

    //kanal koji osluskuje poruku od strane klijenta
    socket.on('sendMessage',(message,callback)=>{
        const user=findUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('The profane is not allowed')
        }
        io.to(user.room).emit('receivedMessage',generate(user.username,message))
        callback()
    })
    // socket.emit('countUpdated',count)
    // socket.on('increment',()=>{
    //     count++
    //     io.emit('countUpdated',count)
    // })

    //kanal koji obavestava da je neki user napustio chat
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('leaveChat',generate(`The user ${user.username} has left the chat!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:listOfUsersByRoom(user.room)
            })
        }
     
    })
    socket.on('sendLocation',(location,callback)=>{
        const user=findUser(socket.id)
        if(user){
        io.to(user.room).emit('shareClientLocation',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        }
        callback()
    })
})
server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})