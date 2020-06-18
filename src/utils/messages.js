const generate=(username,text)=>{
    return {
        username,
        text,
        createdAt:new Date().getTime()
    }
}
const generateLocationMessage=(username,locationLink)=>{
    return {
        username,
        locationLink,
        createdAt:new Date().getTime()
    }
}
module.exports={
    generate,
    generateLocationMessage
}