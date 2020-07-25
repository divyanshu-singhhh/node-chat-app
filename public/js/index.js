
 fetch('/getrooms').then((res) => {
     res.json().then((data) => {
         addToList(data)
     })
 })

 const addToList = (rooms) => {
    var options = ''

    for(var i = 0; i < rooms.length; i++){
      options += '<option value="'+rooms[i]+'" />'
    }
  
    document.getElementById('room').innerHTML = options
 }
