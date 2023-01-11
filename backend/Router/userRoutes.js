const express = require("express");
const {registerUser,authUser,allUsers} = require("../controller/userController")
const {protect} = require("../middleware/authMiddleware")

const router = express.Router();

router.route("/").post(registerUser).get(protect,allUsers);
/* above line can also be written as
    router.post("/",registerUser)
*/

router.post("/login",authUser)

module.exports = router