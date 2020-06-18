const users=[]

const addUser=({id,username,room})=>{
    //clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()
    //validation

    if(!username || !room){
        return {
            error:"The username and room are required"
        }
    }
    const existingUser=users.find((user)=>{
        return user.username===username && user.room===room
    })

    if(existingUser){
        return {
            error:"The user already existing in this room"
        }
    }
    const user={id,username,room}
    users.push(user)
    return {user}
}

addUser({
    id:21,
    username:"Borislav",
    room:"zezanje"
})
const res=addUser({
    id:32,
    username:'',
    room:''
})
console.log(users)
console.log(res)

const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)
    if(index!==-1){
        return users.splice(index,1)[0]
    }

}
const findUser=(id)=>{
    return users.find((user)=>user.id===id)
}
const listOfUsersByRoom=(room)=>{
    let list=[]
    users.find((user)=>{
        if(user.room===room){
            list.push(user)
        }
    })

    return list
}

console.log(users)

module.exports={
    listOfUsersByRoom,
    findUser,
    removeUser,
    addUser
}