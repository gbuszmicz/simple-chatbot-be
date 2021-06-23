// eslint-disable-next-line no-undef
const socket = io();

// eslint-disable-next-line no-undef
const inputMessage = document.getElementById('inputMessage')

function addMessage(message, customClass) {
  // eslint-disable-next-line no-undef
  const text = document.createTextNode(message)
  // eslint-disable-next-line no-undef
  const el = document.createElement('li')
  el.classList.add(customClass)
  // eslint-disable-next-line no-undef
  const messages = document.getElementById('messages')
  el.appendChild(text)
  messages.prepend(el)
}

// Socket events
socket.on('response', (data) => {
  addMessage(data, 'user-event')
});

socket.on('disconnect', () => {
  addMessage('[socket-event] you have been disconnected', 'socket-event')
});

socket.on('reconnect', () => {
  addMessage('[socket-event] you have been reconnected', 'socket-event')
});

socket.on('reconnect_error', () => {
  addMessage('[socket-event] attempt to reconnect has failed', 'socket-event')
});

socket.on("connect_error", (err) => {
  addMessage(`[socket-event] connect_error due to ${err.message}`, 'socket-event')
});

socket.on("connect", () => {
  addMessage('[socket-event] connected', 'socket-event')
})

socket.on('error', (data) => {
  addMessage(data, 'user-event')
})

inputMessage.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault()
    const msg = inputMessage.value
    socket.emit('message', msg)
    addMessage(msg)
    inputMessage.value = ''
  }
})