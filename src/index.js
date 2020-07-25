const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const {addRoom, removeRoom, getAllRooms} = require('./utils/room')
const { get } = require('https')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.static('public'))

//socket.emit --> specific client , io.emit --> all the client , socket.broadcast.emit --> every client except one 
// io.to.emit --> everyone in a specific room, socket.broadcast.to.emit --> everyone except specific client in a chatroom

io.on('connection' , (socket) => {
    console.log('New Websocket Connection')
    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    //     //socket.emit('countUpdated', count)
    //     io.emit('countUpdated',count)
    // })
    

    socket.on('join' , ({username , room},callback) => {
        const {error , user} = addUser({id: socket.id, username,room})

        if(error){
           return callback(error)
        }

        socket.join(user.room)
        addRoom(user.room)

        socket.emit('message', generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })


    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        const user = getUser(socket.id)
        io.to(user.room).emit('message' , generateMessage(user.username,message))

        //acknowledgement
        callback()
    })

    socket.on('sendLocation' , (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage' , generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

        //acknowledgement
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        if(getUsersInRoom(user.room).length === 0){
            removeRoom(user.room)
        }
    })
})

//get all rooms api
app.get('/getrooms', (req,res) => {
    res.send(getAllRooms())
})


server.listen(port , () => {
    console.log("App is running on port " + port)
})