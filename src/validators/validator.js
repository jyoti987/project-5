const mongoose = require('mongoose')

const isValidName = function (value) {
    if (typeof value === "undefined" || value === null || value == " ")
        return false;
    if (typeof value === "string" && value.trim().length > 0 && value.match(/^[a-zA-Z]*$/))
        return true;
    return false;
}

const isValidEmail = function (value) {
    return (/^[a-z0-9_]{1,}@[a-z]{3,}[.]{1}[a-z]{3,6}$/).test(value)
      
}

const isValidPhone = function (value) {
   return (/^[\s]*[6-9]\d{9}[\s]*$/gi).test(value)
       

}
const isValidPass = function (value) {
   if(value.match(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/))
    return true
   return false
       
}

const isValidStreet = function (value) {
    return (/^[\s]*[a-zA-Z-0-9,. ]+([\s]?[a-zA-Z-0-9]+)*[\s]*$/).test(value)
       
}

const isValidPincode = function (value) {
    return (/^\d{6}$/).test(value);
        
}

const isValidObjectId = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}

const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0;
}


const isValid=function(value){
    if (typeof value === "undefined" || typeof value === "null") return true;
  if (typeof value === "string" && value.trim().length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;

}
module.exports = { isValid,isValidObjectId, isValidRequestBody, isValidEmail, isValidName, isValidPass, isValidPhone, isValidStreet, isValidPincode }