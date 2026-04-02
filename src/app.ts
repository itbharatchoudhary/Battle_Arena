import express from "express";
import useGraph from "./services/graph.ai.services.js"


const app = express();

app.get("/health", (req, res) => {
    res.send(200).json({ String: "ok" })
})

app.post("/user-graph", async(req,res)=>{
   await useGraph("write an factorial function in javascript");
})

export default app