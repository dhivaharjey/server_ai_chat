import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

const allowOrigins = [
  `${process.env.FRONT_END_URL}`,
  `${process.env.LOCALHOST_URL}`,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Cors error"));
      }
    },
    credentials: true,
  })
);
const openai = new OpenAI({
  organization: process.env.ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});
app.post("/chat", async (req, res) => {
  try {
    const { message, model: aiModel } = req.body;
    // console.log(aiModel);

    // const options = {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    //     "Content-type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     model: "gpt-4o-mini",
    //     message: [{ role: "user", content: `${message}` }],
    //     max_tokens: 100,
    //   }),
    // };

    // const response = await fetch(
    //   "https://api.openai.com/v1/chat/completions",
    //   options
    // );
    // const data = await response.json();
    // console.log(data?.choices[0]?.message);
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (aiModel === "dall-e-3") {
      const image = await openai.images.generate({
        model: "dall-e-2",
        prompt: "A cute baby sea otter",
      });
      return res.status(200).json({ image: image?.data[0]?.url });
    }
    const response = await openai.chat.completions.create({
      model: aiModel || "gpt-4o-mini",
      messages: [{ role: "user", content: `${message}` }],
      max_tokens: 100,
    });

    // console.log(response?.choices[0]?.message);

    // return res.status(200).json({message:response?.choices[0]?.message});
    return res.status(200).json(response?.choices[0]?.message);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error?.message);
  }
});
app.get("/aiModels", async (req, res) => {
  try {
    // const options = {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    //     "Content-type": "application/json",
    //   },
    // };
    // const res = await fetch("https://api.openai.com/v1/models", options);
    const response = await openai.models.list();

    return res.status(200).json(response?.data);
  } catch (error) {
    console.log(error);
    return res.json(error?.message);
  }
});

app.get("/", (req, res) => {
  res.send("App is running");
});

app.listen(port || 5000, (req, res) => {
  console.log("Server running on port", port);
});
