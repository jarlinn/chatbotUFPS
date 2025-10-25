// Chatbot widget script
;(() => {
  // Create chatbot button
  const createChatButton = () => {
    const button = document.createElement("button")
    button.id = "chat-widget-button"
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `
    button.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: oklch(0.45 0.15 25);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: transform 0.2s, box-shadow 0.2s;
    `

    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.1)"
      button.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)"
    })

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)"
      button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
    })

    button.addEventListener("click", () => {
      toggleChatWidget()
    })

    return button
  }

  // Create chat widget container
  const createChatWidget = () => {
    let conversationHistory = []

    // Load history from localStorage
    const loadHistory = () => {
      const stored = localStorage.getItem('chatHistory')
      if (stored) {
        conversationHistory = JSON.parse(stored)
        // Restore messages to UI
        conversationHistory.forEach(msg => {
          addMessage(msg.text, msg.role)
        })
      }
    }

    // Save history to localStorage
    const saveHistory = () => {
      localStorage.setItem('chatHistory', JSON.stringify(conversationHistory))
    }

    const widget = document.createElement("div")
    widget.id = "chat-widget-container"
    widget.style.cssText = `
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 360px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      z-index: 1000;
      overflow: hidden;
    `

    widget.innerHTML = `
      <div style="background: oklch(0.45 0.15 25); color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Asistente Virtual UFPS</h3>
        <button id="close-chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px;">×</button>
      </div>
      <div class="messages" style="flex: 1; padding: 16px; overflow-y: auto; background: #f9f9f9; display: flex; flex-direction: column;">
        <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; align-self: flex-start;">
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">¡Hola! Soy el asistente virtual del Programa de Ingeniería de Sistemas. ¿En qué puedo ayudarte hoy?</p>
        </div>
      </div>
      <div style="padding: 16px; border-top: 1px solid #e5e5e5; background: white;">
        <div style="display: flex; gap: 8px;">
          <input id="chat-input" type="text" placeholder="Escribe tu mensaje..." style="flex: 1; padding: 10px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 14px;" />
          <button id="send-button" style="background: oklch(0.45 0.15 25); color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">Enviar</button>
        </div>
      </div>
    `

    const closeButton = widget.querySelector("#close-chat")
    closeButton.addEventListener("click", () => {
      widget.style.display = "none"
    })

    const input = widget.querySelector("#chat-input")
    const sendButton = widget.querySelector("#send-button")
    const messagesContainer = widget.querySelector(".messages")

    // Load history on widget creation
    loadHistory()

    const addMessage = (text, type) => {
      const messageDiv = document.createElement("div")
      messageDiv.style.cssText = type === 'user'
        ? "background: oklch(0.45 0.15 25); color: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; align-self: flex-end; max-width: 80%;"
        : "background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; align-self: flex-start; max-width: 80%;"
      messageDiv.textContent = text
      messagesContainer.appendChild(messageDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight

      // Add to history
      conversationHistory.push({ role: type, text: text })
      // Limit to last 20 messages
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20)
      }
      saveHistory()
    }

    const sendToWebhook = (message) => {
      fetch('http://localhost:5678/webhook/chatbot-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_text: message,
          conversation_history: conversationHistory.slice(0, -1) // Exclude the current user message
        }),
      })
      .then(response => response.json())
      .then(data => {
        const responseText = data.model_response || 'Lo siento, no puedo responder a esa pregunta en este momento.'
        addMessage(responseText, 'bot')
      })
      .catch(error => {
        addMessage('Lo siento, hubo un error al procesar tu mensaje.', 'bot')
      })
    }

    sendButton.addEventListener("click", () => {
      const message = input.value.trim()
      if (message) {
        addMessage(message, 'user')
        sendToWebhook(message)
        input.value = ''
      }
    })

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendButton.click()
      }
    })

    return widget
  }

  // Toggle chat widget visibility
  const toggleChatWidget = () => {
    const widget = document.getElementById("chat-widget-container")
    if (widget.style.display === "none" || widget.style.display === "") {
      widget.style.display = "flex"
    } else {
      widget.style.display = "none"
    }
  }

  // Initialize widget when DOM is ready
  const init = () => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init)
      return
    }

    const button = createChatButton()
    const widget = createChatWidget()

    document.body.appendChild(button)
    document.body.appendChild(widget)
  }

  init()
})()
