import express from "express";


const app = express();

app.post("/",(req,res)=>{
    res.send(200).json({status:"ok"});
})

export default app;