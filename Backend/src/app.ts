import express from "express";
import cors from "cors";
import rungraph from "./ai/graph.ai.js";

const app = express();

// ✅ CORS config
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));



app.use(express.json());

app.post("/invoke", async (req, res) => {
  try {
    const { input } = req.body;

    //  VALIDATION
    if (!input || input.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Input is required"
      });
    }

    const result = await rungraph(input);

    res.status(200).json({
      message: "Graph executes successfully",
      success: true,
      data: result
    });

  } catch (error) {
    console.error(" FULL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error executing graph",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default app;