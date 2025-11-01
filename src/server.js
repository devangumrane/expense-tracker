import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/v1/index.js"; 

dotenv.config();
const app = express();

// CORS configuration
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(helmet()); // Security middleware
app.use(morgan("dev")); // Logging middleware

app.use("/api/v1", router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
