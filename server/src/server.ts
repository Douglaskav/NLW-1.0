import express from "express";
import cors from "cors";
import router from "./routes";
import path from "path";
import { errors } from "celebrate";

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")))

app.use(errors());

app.listen(3333, () => console.log("Server started in 3333"));
