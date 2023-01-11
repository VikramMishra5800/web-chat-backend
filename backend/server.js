const express = require("express");
const {chats} = require("./data/data")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const userRoutes = require("./Router/userRoutes")
const chatRoutes = require("./Router/chatRoutes");
const messageRoutes = require("./Router/messageRoutes");
const path = require("path");

dotenv.config({path:".env"});
connectDB();

const app = express();

//used to tell the server or express too accept json data from frontend
app.use(express.json());

// app.get("/",(req,res)=>{
//     res.send("API is running successfully");
// })


app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT,console.log(`Server is running at PORT ${PORT}`));

const io = require("socket.io")(server,{
    pingTimeout: 60000,
    cors:{
        origin: "http://localhost:3000"
    }
})

io.on("connection",(socket) => {
    console.log("connected to socket.io");

    // another socket for user personal room
    socket.on("setup",(userData)=>{
        socket.join(userData._id);
        socket.emit("connected");
    })

    // another socket to create a room when any user clicks on any chat
    socket.on("join chat",(room)=>{
        socket.join(room);  
    })
 
    socket.on("typing",(room)=> socket.in(room).emit("typing"));
    socket.on("stop typing",(room)=> socket.in(room).emit("stop typing"));

    socket.on("new message",(newMessageReceived)=>{
        var chat = newMessageReceived.chat;

        if(!chat.users)
        return console.log("chat.users not defined");

        chat.users.forEach((user)=>{
            if(user._id === newMessageReceived.sender._id)
            return;

            socket.in(user._id).emit("message received",newMessageReceived);
        })
     })

    socket.off("setup", ()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    })
})