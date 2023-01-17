import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
let loadIntervel

function loader(element){
  element.textContent = ''

  loadIntervel = setInterval(() => {
    element.textContent += '.'

    if(element.textContent === '....'){
      element.textContent = ''
    }
  }, 300);
}

function typing(element, text){
  let i = 0
  let interval = setInterval(() => {
    if(i < text.length){
      element.innerHTML += text.charAt(i)
      i++
    }
    else {
      clearInterval(interval)
    }
  }, 20);
}

function generateID(){
  const timeStamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timeStamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const submit = async(e) => {
  e.preventDefault()

  const data = new FormData(form)
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  form.reset()

  const uniqueId = generateID()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  chatContainer.scrollTop = chatContainer.scrollHeight
  const message = document.getElementById(uniqueId)
  loader(message)

  const res = await fetch('http://localhost:5000', {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadIntervel)
  message.innerHTML = ''
  
  if(res.ok) {
    const data = await res.json()
    const parsedData = data.bot.trim()
    typing(message,parsedData)
  }
  else{
    const err = await res.text()
    message.innerHTML = "Something went wrong"
    alert(err)
  }
}

form.addEventListener('submit', submit)
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13) {
    submit(e)
  }
})