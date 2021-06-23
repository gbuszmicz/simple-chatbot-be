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

function sendMessage(msg) {
  // eslint-disable-next-line no-undef
  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/api/v1/messages', true)
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  xhr.onload = function () {
    addMessage(this.responseText, 'user-event')
  };
  xhr.send(`msg=${msg}`);
}

inputMessage.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault()
    const msg = inputMessage.value
    sendMessage(msg)
    addMessage(msg)
    inputMessage.value = ''
  }
})