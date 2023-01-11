const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup} = require("../controller/chatController");

const router = express.Router();

router.route("/").post(protect,accessChat).get(protect,fetchChats);
router.post("/group",protect,createGroupChat);
router.put("/rename",protect,renameGroup);

router.route("/groupadd").put(protect,addToGroup);
router.route("/groupremove").put(protect,removeFromGroup);

module.exports = router