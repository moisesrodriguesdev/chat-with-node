const express = require("express"); // É atribuido a variavel express, todas as funcionalidades que o framework Express traz
const path = require("path"); // Pacote do Node utilizado para mapear diretórios
const app = express(); // Variável app utilizado para startar o servidor

const server = require("http").createServer(app); // O server é criado a partir de um pacote próprio do Node (http)
const io = require("socket.io")(server); // socket é um protoloco de comunicação, assim como o http

app.use(express.static(path.join(__dirname, "public"))); // O diretório public é utilizado para hospedar as páginas HTML
app.set("views", path.join(__dirname, "public")); // Seta configurações de views na pasta public
app.engine("html", require("ejs").renderFile); // A engine a ser utilizada é o EJS. No final será renderizado um arquivo .html
app.set("view engine", "html"); // Seta configurações de interface

app.use("/", (request, response) => {
  // No endereço raiz (/) é renderizado o arquivo index.html como resposta
  response.render("index.html");
});

let messages = []; // Atribui a variavel messages, um array de mensagens
let users = []; // Atribui a variavel users, um array de usuários

// Seta configuração de conexão do socket
io.on("connection", (socket) => {
  // Implementação do evento de 'Adicionar o Usuário'
  socket.on("ADD_USER", (user) => {
    users.push(user); // Usuário é inserido no array

    socket.emit("LIST_USERS_ONLINE", users); // Socket disparada o evento LIST_USERS_ONLINE, passando o array de usuários logados

    socket.broadcast.emit("NEW_USER_CHAT", user); // Socket disparada o evento, informando que mais um usuário adentrou o chat
  });

  // Implementação do evento de 'Enviar Mensagem'
  socket.on("SEND_MESSAGE", (data) => {
    // Implementação do evento de 'Enviar Mensagem'
    if (data.message.match(/Bye/)) {
      users.splice(users.indexOf(data.usuario), 1);
      // Verifica no objeto, o atributo message se contém a palavra Bye.
      socket.disconnect(); // Se for verdadeiro, o usuário é desconectado do chat

      socket.broadcast.emit("USER_DISCONNECT", data.usuario); // Socket disparada o evento USER_DISCONNECT, passando o nome do usuário desconectado
    } else {
      if (data.message.match(/List/)) {
        // Se a 1° verificação for falsa, é verificado no objeto se contém a palavra List
        socket.emit("LIST_USERS_ONLINE_CHAT", users); // Se for verdadeiro, Socket disparada o evento LIST_USERS_ONLINE_CHAT, passando o nome de todos os usuário conectados
      } else {
        messages.push(data); // Se todas as verificações forem falsas, a mensagem é armazenada no array e em seguida é enviada a todos os usuários no chat
        socket.broadcast.emit("SEND_ALL_USERS", data);
      }
    }
  });
});

server.listen(3000); // Seta configuração de porta do servidor
