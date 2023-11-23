import { socket } from "../app.js";

// Escuchar el evento 'message'
socket.on("message", (message) => {
    // Obtener el elemento del DOM donde se mostrarán los mensajes
    const messagesDiv = document.getElementById("messages");

    // Crear el HTML para el mensaje
    const messageDiv = document.createElement("div");
    const user = document.createElement("strong");
    const msg = document.createElement("p");

    user.textContent = message.user + ":";
    msg.textContent = message.msg;

    messageDiv.appendChild(user);
    messageDiv.appendChild(msg);

    // Agregar el mensaje a la vista
    messagesDiv.appendChild(messageDiv);

    // Desplazarse hasta el último mensaje
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Enviar un mensaje cuando se envía el formulario
document.getElementById("message-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;

    const messageUser = document.getElementById("message-user");
    const user = messageUser.value;
    // Emitir el evento 'send-message'
    socket.emit("send-message", { user: user, message: message });

    // Limpiar el input
    messageInput.value = "";
});
