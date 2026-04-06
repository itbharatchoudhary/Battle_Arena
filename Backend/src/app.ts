import express from "express";
import rungraph from "./ai/graph.ai.js"

const app = express();

app.post("/", async (req, res) => {
    const result = await rungraph("What is the capital of France?")
    res.json(result)

})

app.post("/invoke", async (req, res) => {
    const { input } = req.body;
    const result = await rungraph(input);

    res.status(200).json({
        message:" Graph executes successfully",
        success:true,
        data:result
    })

    
})


export default app;