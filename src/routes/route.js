const express = require('express');
const{createUser,loginUser, updateUser}=require("../controllers/userController")
const router = express.Router();

router.post("/register",createUser);
router.post("/login",loginUser);
router.put("/user/:userId/profile",updateUser)
module.exports={router}









router.all("/*", function (req, res) {
    res.status(400).send({status: false,message: "The api you request is not available"})
})
module.exports = router;