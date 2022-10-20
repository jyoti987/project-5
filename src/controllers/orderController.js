const { isValidObjectId } = require('mongoose')
// const { aggregate } = require('../models/cartModel')
const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const { isValidRequestBody } = require('../validators/userValidation')


const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let requestBody = req.body
        let { cartId, cancellable, status } = requestBody

        if (!isValidRequestBody(requestBody))
            return res.status(400)
                .send({ status: false, message: "request Body cant be emp" })

        if (!isValidObjectId(cartId))
            return res.status(400)
                .send({ status: false, message: "cart Id is not valid " })

        let findUserCart = await cartModel.findOne({ userId: userId }).select({ createdAt: 0, updatedAt: 0, __v: 0 }).lean()

        if (!findUserCart)
            return res.status(404)
                .send({ status: false, message: "Requested User Cart Not found" })

        if (findUserCart.items.length == 0)
            return res.status(404)
                .send({ status: false, message: "No any product or Items in your Cart" })


        if (cartId != findUserCart._id)
            return res.status(400)
                .send({ status: false, message: "Access denied, this is not your cart" })


        let totalQuantity = 0
        for (let obj of findUserCart.items) {
            totalQuantity += obj.quantity
        }

        findUserCart.totalQuantity = totalQuantity
        delete findUserCart._id

        if (cancellable) {
            if (!(cancellable == true || cancellable == false)) {
                return res.status(400)
                    .send({ status: false, message: "cancellable value is true or false only" })
            }
            findUserCart.cancellable = cancellable
        }

        const isValideStatus = function (status) {
            return ["pending", "completed", "cancled"].includes(status)
        }
        if (status) {
            if (!isValideStatus(status))
                return res.status(400)
                    .send({ status: false, message: "status Value should be [pending, completed, cancled]" })

            findUserCart.status = status
        }

        let orderCreate = await orderModel.create(findUserCart)

        if (orderCreate) {

            let clearCart = await cartModel.findByIdAndUpdate(cartId, { $set: { items: [], totalPrice: 0, totalItems: 0 } })
        }

        let order = await orderModel.findOne({ userId: userId }).populate('items.productId')
        return res.status(201)
            .send({ status: true, message: "Success", data: order })
    }
    catch (err) {

        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createOrder }