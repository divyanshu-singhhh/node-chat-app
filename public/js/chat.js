const socket  = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})  //location search stores query string , qs.parse parses it into object

const autoScroll = () => {
    // New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have we scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    // console.log(url)
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    //disable button
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = event.target.elements.message.value
    socket.emit('sendMessage', message , (error) =>{
        //enable button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }

        console.log('Message Delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported for your browser')
    }

    //disable send location button
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
    
        socket.emit('sendLocation',{latitude: position.coords.latitude , longitude: position.coords.longitude}, () => {
            //enable send location button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})

socket.emit('join' , {username, room} , (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})


// socket.on('countUpdated', (count) => {
//     console.log('the count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })