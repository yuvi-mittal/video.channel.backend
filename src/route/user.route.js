import {Router} from "express";
import {loginUser, logOutUser, refreshAccessToken, registerUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([      //uploading it on multer 
        {
            name : "avatar",
            maxcount: 1,
        },
        {
            name :"coverImage",
            maxcount: 1,
        }
    ]),
    registerUser )

    router.route("/login").post(loginUser)

     router.route("/logout").post(verifyJWT, logOutUser)
     router.route("/refresh-token").post(refreshAccessToken)

export default router