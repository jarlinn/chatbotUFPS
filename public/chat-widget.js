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
          if (msg.isFile) {
            addMessage(msg.fileUrl || msg.text, msg.role, msg.timestamp, msg.isFile)
          } else {
            addMessage(msg.text, msg.role, msg.timestamp, msg.isFile || false)
          }
        })
      }
    }

    // Save history to localStorage
    const saveHistory = () => {
      localStorage.setItem('chatHistory', JSON.stringify(conversationHistory))
    }

    // Format timestamp
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }

    // Parse Markdown formatting
    const parseMarkdown = (text) => {
      // Escape HTML to prevent XSS
      let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      
      // Bold: **text** or __text__
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
      
      // Italic: *text* or _text_
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
      html = html.replace(/_(.+?)_/g, '<em>$1</em>')
      
      // Bold + Italic: ***text*** or ___text___
      html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
      
      // Code inline: `code`
      html = html.replace(/`(.+?)`/g, '<code style="background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 13px;">$1</code>')
      
      // Links: [text](url)
      html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">$1</a>')
      
      return html
    }

    // Fetch greeting from webhook (will be defined after messagesContainer)
    let fetchGreeting

    const widget = document.createElement("div")
    widget.id = "chat-widget-container"
    widget.style.cssText = `
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 450px;
      height: 650px;
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
        <div style="display: flex; gap: 8px; align-items: center;">
          <button id="clear-chat" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; font-size: 12px; padding: 6px 12px; border-radius: 6px; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">Limpiar</button>
          <button id="close-chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px;">×</button>
        </div>
      </div>
      <div class="messages" style="flex: 1; padding: 16px; overflow-y: auto; background: #f9f9f9; display: flex; flex-direction: column;">
        <!-- Messages will be loaded dynamically -->
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

    // Define addMessage function before it's used
    const addMessage = (text, type, timestamp = Date.now(), isFile = false) => {
      const messageWrapper = document.createElement("div")
      messageWrapper.style.cssText = type === 'user'
        ? "display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 12px;"
        : "display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 12px;"

      const messageDiv = document.createElement("div")
      messageDiv.style.cssText = type === 'user'
        ? "background: oklch(0.45 0.15 25); color: white; padding: 12px; border-radius: 8px; max-width: 80%; word-wrap: break-word; white-space: pre-wrap;"
        : "background: white; padding: 12px; border-radius: 8px; max-width: 80%; word-wrap: break-word; white-space: pre-wrap;"

      // Create content with proper formatting
      const contentDiv = document.createElement("div")
      contentDiv.style.cssText = "margin: 0; font-size: 14px; line-height: 1.6;"

      if (isFile) {
        // Create download button for file
        const button = document.createElement("button")
        button.style.cssText = `
          background: white;
          color: oklch(0.45 0.15 25);
          border: 2px solid oklch(0.45 0.15 25);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          margin: 2px 0;
        `
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar archivo
        `
        button.addEventListener("mouseenter", () => {
          button.style.background = "oklch(0.45 0.15 25)"
          button.style.color = "white"
          button.style.transform = "translateY(-1px)"
          button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"
        })
        button.addEventListener("mouseleave", () => {
          button.style.background = "white"
          button.style.color = "oklch(0.45 0.15 25)"
          button.style.transform = "translateY(0)"
          button.style.boxShadow = "none"
        })
        button.addEventListener("click", () => {
          window.open(text, '_blank', 'noopener,noreferrer')
        })
        contentDiv.appendChild(button)
      } else {
        // Process text to handle line breaks and formatting
        const formattedText = text
          .replace(/\\n/g, '\n')  // Convert \n strings to actual line breaks
          .trim()

        // Split by double line breaks for paragraphs
        const paragraphs = formattedText.split('\n\n')
        paragraphs.forEach((paragraph, index) => {
          const p = document.createElement("p")
          p.style.cssText = "margin: 0; margin-bottom: 8px;"
          if (index === paragraphs.length - 1) {
            p.style.marginBottom = "0"
          }

          // Handle single line breaks within paragraphs
          const lines = paragraph.split('\n')
          lines.forEach((line, lineIndex) => {
            // Check if line starts with special characters (bullets, numbers, etc.)
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine)) {
              const span = document.createElement("span")
              span.style.cssText = "display: block; margin-left: 8px; margin-bottom: 4px;"
              // Parse markdown in list items
              span.innerHTML = parseMarkdown(trimmedLine)
              p.appendChild(span)
            } else {
              if (lineIndex > 0) {
                p.appendChild(document.createElement("br"))
              }
              // Parse markdown in regular text
              const textSpan = document.createElement("span")
              textSpan.innerHTML = parseMarkdown(trimmedLine)
              p.appendChild(textSpan)
            }
          })

          contentDiv.appendChild(p)
        })
      }

      messageDiv.appendChild(contentDiv)

      // Add timestamp
      const timeDiv = document.createElement("div")
      timeDiv.style.cssText = type === 'user'
        ? "font-size: 10px; color: #666; margin-top: 4px; text-align: right;"
        : "font-size: 10px; color: #999; margin-top: 4px; text-align: left;"
      timeDiv.textContent = formatTime(timestamp)

      messageWrapper.appendChild(messageDiv)
      messageWrapper.appendChild(timeDiv)
      messagesContainer.appendChild(messageWrapper)
      messagesContainer.scrollTop = messagesContainer.scrollHeight

      // Add to history with timestamp (only for non-file messages)
      if (!isFile) {
        conversationHistory.push({ role: type, text: text, timestamp: timestamp, isFile: isFile })
        // Limit to last 20 messages
        if (conversationHistory.length > 20) {
          conversationHistory = conversationHistory.slice(-20)
        }
        saveHistory()
      } else {
        // For file messages, save the user question that led to this file
        const lastUserMessage = conversationHistory.filter(msg => msg.role === 'user').pop()
        if (lastUserMessage) {
          conversationHistory.push({ role: type, text: lastUserMessage.text, timestamp: timestamp, isFile: isFile, fileUrl: text })
          // Limit to last 20 messages
          if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20)
          }
          saveHistory()
        }
      }
    }

    // Show loading indicator
    const showLoadingIndicator = () => {
      const loadingDiv = document.createElement("div")
      loadingDiv.id = "loading-indicator"
      loadingDiv.style.cssText = "display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 12px;"
      
      const loadingMessage = document.createElement("div")
      loadingMessage.style.cssText = "background: white; padding: 12px; border-radius: 8px; max-width: 80%;"
      
      const loadingText = document.createElement("div")
      loadingText.style.cssText = "margin: 0; font-size: 14px; line-height: 1.6; color: #666;"
      loadingText.innerHTML = '<span style="animation: pulse 1.5s ease-in-out infinite;">Cargando...</span>'
      
      // Add CSS animation
      const style = document.createElement('style')
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `
      document.head.appendChild(style)
      
      loadingMessage.appendChild(loadingText)
      loadingDiv.appendChild(loadingMessage)
      messagesContainer.appendChild(loadingDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }

    // Remove loading indicator
    const removeLoadingIndicator = () => {
      const loadingDiv = document.getElementById("loading-indicator")
      if (loadingDiv) {
        loadingDiv.remove()
      }
    }

    // Define fetchGreeting function after addMessage is available
    fetchGreeting = () => {
      // Clear messages and show loading
      messagesContainer.innerHTML = ''
      showLoadingIndicator()
      
      fetch(window.N8N_BASE_URL + '/webhook/chatbot-greet', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        console.log('Greeting response:', data)
        removeLoadingIndicator()
        const greetingText = data.model_response
        addMessage(greetingText, 'bot')
      })
      .catch(error => {
        console.error('Error fetching greeting:', error)
        removeLoadingIndicator()
        // Fallback to default greeting
        addMessage('¡Hola! Soy el asistente virtual del Programa de Ingeniería de Sistemas. ¿En qué puedo ayudarte hoy?', 'bot')
      })
    }

    // Clear chat function - resets everything to initial state
    const clearChat = () => {
      // Clear conversation history array
      conversationHistory = []
      
      // Remove from localStorage
      localStorage.removeItem('chatHistory')
      
      // Clear input field
      input.value = ''
      
      // Fetch new greeting from webhook
      fetchGreeting()
    }

    // Add event listener for clear button
    const clearButton = widget.querySelector("#clear-chat")
    clearButton.addEventListener("click", clearChat)

    // Load history on widget creation (after addMessage is defined)
    // If no history exists, fetch greeting from webhook
    const stored = localStorage.getItem('chatHistory')
    if (stored) {
      loadHistory()
    } else {
      fetchGreeting()
    }

    const sendToWebhook = (message) => {
      fetch(window.N8N_BASE_URL + '/webhook/chatbot-answer', {
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
        const isFile = data.file === true
        addMessage(responseText, 'bot', Date.now(), isFile)
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
