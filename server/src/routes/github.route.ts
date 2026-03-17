import express from "express";
const githubRoute = express.Router();
import {
  connectRepo,
  getUserRepos,
  searchRepos,
} from "../controllers/github.controller.js";
import { verifySession } from "../middleware/verifysession.js";

githubRoute.get("/repos", verifySession, getUserRepos);
githubRoute.get("/repo/search", verifySession, searchRepos);
githubRoute.post("/repo/connect", verifySession, connectRepo);
export default githubRoute;
