import express from "express";


const app = express();

app.get("/health", (req, res) => {
    res.send(200).json({ String: "ok" })
})

export default app