import express, { Application } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import initSocket from "./socket";
dotenv.config();
class App{
    app:Application;
    PORT:unknown;

    constructor(){
        this.app = express();
        this.PORT=process.env.PORT ?? 5000
        this.middleware();

    }
    middleware(){
        this.app.use(cors({credentials:true,origin:"*"}));
        this.app.use(express.urlencoded({extended:true,limit:"1000mb"}))
        this.app.use(express.json({limit:"1000mb"}));
    }
    listen(){
        const server = http.createServer(this.app);
        initSocket(server);
        server.listen(this.PORT,()=>{
            console.log(`server is listening at port : ${this.PORT} `);
        })
    }
}
const app = new App();
app.listen();