import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere"


import app_config from "../config/config.js";


export const geminiModel = new ChatGoogle({
    model:"gemini-flash-latest",
    apiKey:app_config.GOOGLE_API_KEY
});

export const mistralaiModel = new ChatMistralAI({
    model:"mistral-medium-latest",
    apiKey:app_config.MISTRAL_API_KEY
});

export const cohereModel = new ChatCohere({
    model:"command-a-03-2025",
    apiKey:app_config.COHERE_API_KEY
});


