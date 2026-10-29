import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";


const autheRouter = Router();


autheRouter.get("/getall", authController.getAllUsers);

autheRouter.post("/register", authController.registerUser)

autheRouter.post("/login", authController.login)

autheRouter.get("/get-me", authController.getMe)

autheRouter.get("/refresh", authController.refreshToken)

autheRouter.get("/logout", authController.logout)

autheRouter.get("/logout-all", authController.logoutAll)




export default autheRouter;