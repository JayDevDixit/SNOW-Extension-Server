import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { find_region } from "../controller/region.controller.js";

const region_router = express.Router();

region_router.post('/region',isAuthenticated,find_region)

export default region_router
