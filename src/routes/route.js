const express = require('express');
const{createUser,loginUser, updateUser, getUserDetails} = require("../controllers/userController")
const{createProduct, getProductDetailsById, deleteProductById, getProductDetails} = require("../controllers/productController")
const {authentication, authorization} = require('../middleware/auth')
const router = express.Router();

//==========Feature I --> User===================
router.post("/register",createUser)
router.post("/login",loginUser)
router.get("/user/:userId/profile",authentication, authorization, getUserDetails)
router.put("/user/:userId/profile",authentication, authorization, updateUser)

//==========Feature II --> Product===================
router.post("/products", createProduct)
router.get("/products",getProductDetails)
router.get("/products/:productId",getProductDetailsById)
router.delete("/products/:productId",deleteProductById)
module.exports={router}









router.all("/*", function (req, res) {
    res.status(400).send({status: false,message: "The api you request is not available"})
})
module.exports = router;