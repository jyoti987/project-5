const express = require('express');
const{createUser,loginUser, updateUser, getUserDetails} = require("../controllers/userController")
const{createProduct, getProductDetailsById, deleteProductById, getProductDetails,productUpdate} = require("../controllers/productController")
const{createCart, updateCart}=require('../controllers/cartController')
const {authentication, authorization} = require('../middleware/auth')
const router = express.Router();

//==========Feature I --> User===================
router.post("/register",createUser)
router.post("/login",loginUser)
router.get("/user/:userId/profile",authentication, getUserDetails)
router.put("/user/:userId/profile",authentication, authorization, updateUser)

//==========Feature II --> Product===================
router.post("/products", createProduct)
router.get("/products",getProductDetails)
router.get("/products/:productId",getProductDetailsById)
router.put("/products/:productId",productUpdate)
router.delete("/products/:productId",deleteProductById)

//==========Feature III --> Product===================
router.post('/users/:userId/cart',createCart)
router.put('/users/:userId/cart',authentication,updateCart)






module.exports=router
 