const mongoose = require('mongoose')

const isValidTitle = function (value) {
    return (/^[a-zA-Z][a-zA-Z0-9 $!-_#@%&\.]+$/).test(value)  
       
}

const isValidPrice = function (value) {
    return (/^\d*\.?\d*$/).test(value)        
}

const isValidStyle = function (value) {
    return (/^[a-zA-Z _.-]+$/).test(value)        
}

const isValidObjectId = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}

const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0;
}


const isValid=function(value){
    if (typeof value === "undefined" || value === null || value == " ")
        return false;
    if (typeof value === "string" && value.trim().length > 0)
        return true;
    return false;

}


module.exports = { isValid, isValidObjectId, isValidRequestBody, isValidTitle, isValidPrice, isValidStyle }