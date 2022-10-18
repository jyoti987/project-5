const userModel = require("../models/userModel");
const productModel = require("../models/productModel")
const cartModel = require('../models/cartModel');
const { isValidObjectId } = require("mongoose");
const { isValidRequestBody} = require("../validators/productValidation")

const createCart = async function (req, res) {
    try {

        let requestBody = req.body;
        let userIdFromParam = req.params.userId

        let { cartId, productId } = requestBody;

        if (!isValidObjectId(productId)) return res.status(400)
            .send({ status: false, message: "Invalid Product Id" })

        const productById = await productModel.findById(productId)

        if (!productById) {
            return res.status(404)
                .send({ status: false, message: " product not found!!!" })
        }

        if (productById.isDeleted == true) {
            return res.status(404)
                .send({ status: false, message: " product is deleted!!!" })
        }

        const userCart = await cartModel.findOne({ userId: userIdFromParam })

        if (!cartId && userCart)
            return res.status(400)
                .send({ status: false, message: "This User Cart Is Alreday Created" })

        //ifcart does not exist for the use
        if (!userCart) {
            let filter = {}

            let prodData = { productId: productById._id, quantity: 1 }

            filter.totalItems = 1
            filter.totalPrice = productById.price
            filter.userId = userIdFromParam
            filter.items = prodData

            await cartModel.create(filter)
            let cartDataAll = await cartModel.findOne({ userId: userIdFromParam }).populate('items.productId')

            return res.status(200)
                .send({ status: true, message: "New cart created with products", data: cartDataAll, });

        }
        if (userCart._id != cartId) {
            return res.status(400)
                .send({ status: false, message: "User Cart ID and Requestd Cart ID Not Match" });
        }

        //if usercart is created but is empty
        if (userCart.items.length === 0) {
            const addedProduct = {
                productId: productById,
                quantity: { $inc: 1 }
            }

            const newItemInCart = await cartModel.findOneAndUpdate({ userId: userIdFromParam }, { $set: { items: [addedProduct] } },
                { $inc: { totalItems: 1, totalPrice: productById.price } }, { new: true }).populate('items.productId')

            return res.status(200)
                .send({ status: true, message: "Product added to cart", data: newItemInCart });
        }

        //for checking if product exist in cart
        {
            let productExistInCart = userCart.items.findIndex(items => items.productId == requestBody.productId);

            //console.log(productExistInCart)

            //if provided product does exist in cart

            if (productExistInCart > -1) {

                const increasedProductQuantity = await cartModel.findOneAndUpdate({ userId: userIdFromParam, "items.productId": productId }, {
                    $inc: { totalPrice: productById.price, totalItems: 1, "items.$.quantity": 1 },
                }, { new: true }).populate('items.productId')

                return res.status(200)
                    .send({ status: true, message: "Product quantity and price updated in the cart", data: increasedProductQuantity });
            }
            //if provided product does not exist in cart

            if (productExistInCart == -1) {
                const updatedProductQuantity = await cartModel.findOneAndUpdate({ userId: userIdFromParam },
                    { $push: { items: { productId: productId, quantity: 1 } }, $inc: { totalPrice: productById.price, totalItems: 1 } },
                    { new: true }).populate('items.productId')

                return res.status(200)
                    .send({ status: true, message: "product updated to cart", data: updatedProductQuantity });
            }
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }

}


//=============================================================Update Cart==========================================================

const updateCart = async function(req, res){
    try{
        let data = req.body
        let userId = req.params.userId

        if (!userId) return res.status(400).send({ status: false, message: "Please Provide userId in the path Params" })

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "userId is not valid" })
        
        if(req.userId !== userId) return res.status(403).send({status:false,message:"user is not authorised"})

        let checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(404).send({ status: false, msg: "user is not found" })

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "request Body can't be empty" });
        }

        let {  productId, cartId, removeProduct } = data

        if (!cartId) return res.status(400).send({ status: false, msg: "plz provide cartId" })

        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: " enter a valid cartId " })

        let findCart = await cartModel.findOne({ _id: cartId, isDeleted: false })

        if (!findCart) return res.status(404).send({ status: false, message: " cart not found" })

        if (userId != findCart.userId) return res.status(403).send({ status: false, message: "Access denied, this is not your cart" })

        if (!productId) return res.status(400).send({ status: false, msg: "plz provide productId" })

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: " enter a valid productId " });

        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!findProduct) return res.status(404).send({ status: false, message: " product does not exists" })
              
        if(typeof removeProduct != "number") return res.status(400).send({ status: false, message: " invalid type of removeProduct field" })

        if ((removeProduct !== 0 && removeProduct !== 1)) {
            return res.status(400).send({ status: false, message: "removeProduct value should be 0 or 1 only " })
        }

        let prices = findProduct.price
        
        let item = findCart.items

        if(item.length == 0) return res.status(404).send({ status: false, message: "cart is empty" })
            let flag = 0;
            for (let i=0 ; i<item.length; i++) {
                if (item[i].productId.toString() == productId) {
                    flag = 1;  //set flag when given  productid is found in cart
                    if (removeProduct == 1) {
                        item[i].quantity--
                        findCart.totalPrice -= prices;

                    } else if(removeProduct == 0 ){
                        let changePrice = item[i].quantity * prices
                        findCart.totalPrice -= changePrice
                        item[i].quantity = 0
                    }
                    if (item[i].quantity == 0) {
                        item.splice(i, 1)
                    }

                }
            }
            if (flag == 0) { return res.status(404).send({ status: false, message: "productId not found in cart" }) } //set flag when given  productid is not found in cart


            findCart.totalItems = item.length
            await findCart.save()
            let find = await cartModel.findOne({userId: userId}).populate('items.productId')
            return res.status(200).send({ status: true, message: "Success", data: find })
}

    catch(error){

        res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createCart, updateCart }