const productModel = require("../models/productModel")
const { uploadFile } = require("../aws/aws")
const mongoose = require('mongoose')
const { isValid, isValidNumber, isValidObjectId, isValidRequestBody, isValidTitle, isValidPrice, isValidStyle } = require("../validators/productValidation")


const createProduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "request Body cant be empty" });
        }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = data

        //title
        if (!title) return res.status(400).send({ status: false, message: "Please enter title" })
        if (!isValid(title)) return res.status(400).send({ status: false, message: "Please enter title in correct format" })
        if(!isValidTitle(title.trim())) return res.status(400).send({ status: false, message: "Enter a proper title" })
        
        //console.log(title)

        const findTitle = await productModel.findOne({ title: title, isDeleted: false })
        if(findTitle) return res.status(400).send({ status: false, message: "Title Already exist!!!" })

        //description
        if (!description) return res.status(400).send({ status: false, message: "Please enter description" })
        if (!isValid(description)) return res.status(400).send({ status: false, message: "Please enter description in correct format" })

        //price
        if (!price) return res.status(400).send({ status: false, message: "Please enter price" })
        //if (!isValidNumber(price.trim())) return res.status(400).send({ status: false, message: "Please enter price in correct format" })
        if(!isValidPrice(price.trim())) return res.status(400).send({ status: false, message: "Enter a proper price" })

        //currencyID
        if (!currencyId) return res.status(400).send({ status: false, message: "Please enter currencyId" })
        currencyId = currencyId.trim().toUpperCase()
        if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "Please enter currency in correct format" })
        if(currencyId != 'INR') return res.status(400).send({ status: false, message: "currencyId invalid" })


        //productImage
        if (files.length == 0) return res.status(400).send({ status: false, message: "Please provide product image file!!" })
        let uploadImage = await uploadFile(files[0])

        //availableSizes
        if(!availableSizes) return res.status(400).send({ status: false, message: "available sizes can't be empty" })
        let sizeList = availableSizes.toUpperCase().split(",").map(x => x.trim());
        if (Array.isArray(sizeList)) {
            for (let i = 0; i < sizeList.length; i++) {
                if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizeList[i]))
                    return res.status(400).send({ status: false, message: "Please Enter valid sizes, it should include only sizes from  (S,XS,M,X,L,XXL,XL) " })
            }
        }
    

        let product = {
            title: title,
            description: description,
            price: price,
            currencyId: currencyId,
            productImage: uploadImage,
            availableSizes: sizeList,
            deletedAt: null
        }

        //currencyFormat
        if (currencyFormat) {
            if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "Please enter currencyFormat in correct format" })
            if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "Please enter a valid currencyFormat" })
            product.currencyFormat = currencyFormat;
        }

        //isFreeShipping
        if (isFreeShipping) {
            isFreeShipping = isFreeShipping.trim()
            if (!(isFreeShipping == "true" || isFreeShipping == "false"))
                return res.status(400).send({ status: false, message: "Please enter a boolean value for isFreeShipping" })
           product.isFreeShipping = isFreeShipping;
        }

        //installments
        if (installments) {
            if (!(/^[0-9]+$/.test(installments))) return res.status(400).send({ status: false, message: "Invalid value for installments" })
            product.installments = installments  
        }

        //style
        if (style) {
            if (!isValid(style)) return res.status(400).send({ status: false, message: "Please enter style in correct format" })
            if(!isValidStyle(style.trim())) return res.status(400).send({ status: false, message: "Enter a proper style" })
            product.style = style
        }
        
        //create document
        const newProduct = await productModel.create(product)
        const result = {
            _id: newProduct._id,
            title: newProduct.title,
            description: newProduct.description,
            price: newProduct.price,
            currencyId: newProduct.currencyId,
            currencyFormat: newProduct.currencyFormat,
            isFreeShipping: newProduct.isFreeShipping,
            productImage: newProduct.productImage,
            style: newProduct.style,
            availableSizes: newProduct.availableSizes,
            installments: newProduct.installments,
            deletedAt: newProduct.deletedAt,
            isDeleted: newProduct.isDeleted,
            createdAt: newProduct.createdAt,
            updatedAt: newProduct.updatedAt
        }
        return res.status(201).send({ status: "true", message: "Success", data: result})
        
    } 
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = {createProduct}