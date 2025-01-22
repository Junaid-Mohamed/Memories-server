import axios from "axios";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { setSecureCookie } from "./service/index.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(cors({credentials:true, origin: process.env.FRONTEND_URL}));
app.use(cookieParser());

console.log(`${process.env.FRONTEND_URL}
    ${process.env.BACKEND_URL}
    `)

app.get("/",(req,res)=>{
    res.send(`<h1>Welcome to Memories Server</h1>`)
})

app.get("/auth/google", (req,res)=>{
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL}/auth/google/callback&response_type=code&scope=profile email`;
    res.redirect(googleAuthUrl);
})

app.get(`/auth/google/callback`, async (req, res) => {
    const { code } = req.query;
  
    if (!code) {
      return res.status(400).send(`Authorization code not provided.`);
    }
  
    let accessToken;
    try {
      const tokenResponse = await axios.post(
        `https://oauth2.googleapis.com/token`,
        {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
        },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
  
      accessToken = tokenResponse.data.access_token;
      console.log("code here")
      const googleUserDataResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Code before jwt")
      const { id, email, name, picture } = googleUserDataResponse.data;
  
         const jwtToken = jwt.sign(
        { id, email,name,picture },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );
      setSecureCookie(res, jwtToken);
  
      return res.redirect(`${process.env.FRONTEND_URL}/home`);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch access token from Google." });
    }
  });


app.listen(PORT,()=>console.log(`app listening on port ${PORT}`))