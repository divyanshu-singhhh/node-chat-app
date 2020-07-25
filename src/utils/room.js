
const rooms = []

const addRoom = (room) => {
    if(rooms.indexOf(room) === -1){
        rooms.push(room)
    }
}

const removeRoom = (room) => {
    var index = rooms.indexOf(room)
    rooms.splice(index,1)
}

const getAllRooms = () => {
    return rooms
}

module.exports = {
    addRoom,
    removeRoom,
    getAllRooms
}