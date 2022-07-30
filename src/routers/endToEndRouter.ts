import { Router } from "express";
import e2eTestsController from "../controllers/endToEndController";

const e2eRouter = Router();

e2eRouter.post("/reset", e2eTestsController.deleteAll);

export default e2eRouter;