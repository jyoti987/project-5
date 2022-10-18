const userModel = require("../models/userModel");
const productModel = require("../models/productModel")
const cartModel = require('../models/cartModel');
const { isValidObjectId } = require("mongoose");

const createCart = async function (req, res) {
    try {

        let requestBody = req.body;
        let userIdFromParam = req.params.userId

        let { cartId, productId } = requestBody;

        if (!isValidObjectId(productId)) return res.status(400)
            .send({ status: false, message: "Invalide Product Id" })

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
                quantity: { $inc: +1 }
            }

            const newItemInCart = await cartModel.findOneAndUpdate({ userId: userIdFromParam }, { $set: { items: [addedProduct] } },
                { $inc: { totalItems: 1, totalPrice: productById.price } }, { new: true }).populate('items.productId')

            return res.status(200)
                .send({ status: true, message: "Product added to cart", data: newItemInCart });
        }

        //for checking if product exist in cart
        {
            let productExistInCart = userCart.items.findIndex(items => items.productId == requestBody.productId);

            console.log(productExistInCart)

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

module.exports = { createCart }