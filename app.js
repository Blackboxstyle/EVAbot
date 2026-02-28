const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');

/**
 * Añade un mensaje al área de chat
 * @param {string} text 
 * @param {string} sender - 'user' o 'bot'
 * @returns {HTMLElement} - El elemento del mensaje creado
 */
function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
  return messageDiv;
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const message = userInput.value.trim();
  if (message === "") return;

  // 1. Mostrar mensaje del usuario y limpiar input
  addMessage(message, 'user');
  userInput.value = '';

  // 2. Mostrar indicador de "pensando"
  const thinkingMessage = addMessage("EVAbot está pensando...", "bot");
  thinkingMessage.style.opacity = "0.6";

  try {
    // 3. Llamada real a la Netlify Function
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message })
    });

    if (!response.ok) throw new Error('Error en la respuesta del servidor');

    const data = await response.json();

    // 4. Reemplazar texto de carga con la respuesta real
    thinkingMessage.textContent = data.response;
    thinkingMessage.style.opacity = "1";

  } catch (error) {
    console.error("Error al conectar con la API:", error);
    thinkingMessage.textContent = "Hubo un error hablando con el modelo, intenta de nuevo.";
    thinkingMessage.classList.add('error'); // Opcional por si quieres darle estilo rojo
  } finally {
    scrollToBottom();
  }
});