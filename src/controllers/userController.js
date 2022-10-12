//===============================================Importing all the packages/files here===============================================

const userModel = require("../models/userModel");
const { uploadFile } = require("../aws/aws")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const { isValid,isValidRequestBody, isValidObjectId, isValidEmail, isValidName, isValidPass, isValidPhone, isValidStreet, isValidPincode } = require("../validators/validator")

//=====================================================CREATE USER===================================================================

const createUser = async function (req, res) {
    try {
        const reqBody = req.body;
       
        if (!isValidRequestBody(reqBody))
        return res.status(400)
            .send({ status: false, message: "Please provide data in request body!" });
        let files = req.files;

      
        // request Body validation
        
   const { fname, lname, email, password, phone, address } = reqBody //destructuring

        // fname validation
        if (!fname)
            return res.status(400)
                .send({ status: false, message: "fname is required" });
        if (!isValidName(fname.trim()))
            return res.status(400)
                .send({ status: false, message: "fname is not Valid or Empty" });

        // lname validation
        if (!lname)
            return res.status(400)
                .send({ status: false, message: "lname is required" });
        if (!isValidName(lname.trim()))
            return res.status(400)
                .send({ status: false, message: "lname is not Valid or Empty" });

        //email validation
        if (!email)
            return res.status(400)
                .send({ status: false, message: "email is required" });
        if (!isValidEmail(email.trim()))
            return res.status(400)
                .send({ status: false, message: "email is not Valid or Empty" });
        const duplicateEmail = await userModel.findOne({ email: email });
        if (duplicateEmail)
            return res.status(400)
                .send({ status: false, message: "This email is Already Used !" })

        // password validation
        if (!password)
            return res.status(400)
                .send({ status: false, message: "Password is required" });
        if (!isValidPass(password))
            return res.status(400)
                .send({ status: false, message: "Password should be between 8 and 15 character and it should be alpha numeric" });

        //encrypt the password
        reqBody.password = await bcrypt.hash(password, 10);

        // ProfileImage Validation
        if (files.length === 0)
            return res.status(400).
                send({ status: false, message: "ProfileImage is required" });

        let profileImgUrl = await uploadFile(files[0]);
        reqBody.profileImage = profileImgUrl

        //phone validation
        if (!phone)
            return res.status(400)
                .send({ status: false, message: "phone is required" });
        if (typeof phone == "string") {
            if (!isValidPhone(phone))
                return res.status(400)
                    .send({ status: false, message: "phone is not Valid or Empty" });
        }
        const duplicatePhone = await userModel.findOne({ phone: phone });
        if (duplicatePhone)
            return res.status(400)
                .send({ status: false, message: "This phone number is Already Used !" })


        // if (!address || isValid(reqBody.address))
        //     return res.status(400)
        //         .send({ status: false, message: "address is required" });

        // reqBody.address=JSON.parse(reqBody.address);

        const { shipping, billing } = reqBody.address;

        if (reqBody.address && typeof reqBody.address != "object")
            return res.status(400)
                .send({ status: false, message: "Type of address must be object " });




        if (shipping) {
            const { street, city, pincode } = shipping;

            if (!isValidRequestBody(shipping))
                return res.status(400)
                    .send({ status: false, message: "Enter data into the shipping" })


            if (!street)
                return res.status(400)
                    .send({ status: false, message: "street is required" })
            if (!isValidStreet(street))
                return res.status(400)
                    .send({ status: false, message: "street is not valid" })

            if (!city)
                return res.status(400)
                    .send({ status: false, message: "city is required" })

            if (!isValidName(city))
                return res.status(400)
                    .send({ status: false, message: "city is not valid" })

            if (!pincode)
                return res.status(400)
                    .send({ status: false, message: "pincode is required" })
            if (typeof pincode === "string") {
                if (!isValidPincode(pincode))
                    return res.status(400)
                        .send({ status: false, message: "pincode is not valid" })
            }
        } else {
            return res.status(400).send({ status: false, message: "shipping is required" })
        }

        if (billing) {
            if (!isValidRequestBody(billing))
                return res.status(400)
                    .send({ status: false, message: "Enter data into the billing" })

            const { street, city, pincode } = billing;
            if (!street)
                return res.status(400)
                    .send({ status: false, message: "street is required" })
            if (!isValidStreet(street))
                return res.status(400)
                    .send({ status: false, message: "street is not valid" })

            if (!city)
                return res.status(400)
                    .send({ status: false, message: "city is required" })

            if (!isValidName(city))
                return res.status(400)
                    .send({ status: false, message: "city is not valid" })

            if (!pincode)
                return res.status(400)
                    .send({ status: false, message: "pincode is required" })

            if (!isValidPincode(pincode))
                return res.status(400)
                    .send({ status: false, message: "pincode is not valid" })
        } else {
            return res.status(400).send({ status: false, message: "billing is required" })
        }


        const user = await userModel.create(reqBody);
        //console.log(user)
        return res.status(201)
            .send({ status: true, message: "User is created Sucessfully", data: user })
    } catch (err) {
        return res.status(500).send(err.message);
    }
}




//==========================================================Login====================================================================

const loginUser = async function (req, res) {
    try {
        let requestBody = req.body

        if (!isValidRequestBody(requestBody)) { return res.status(400).send({ status: false, message: "requestBody can't be empty" }) }

        let { email, password } = requestBody

        if (!(email)) { return res.status(400).send({ status: false, message: "email is required" }) }

        if (!(password)) {
             return res.status(400).
             send({ status: false, message: "password is required" }) }

        //User Present or Not
        let user = await userModel.findOne({ email: email })
        if (!user) {
            return res.status(404).send({ status: false, message: "Email id not found" })
        }


        const matchPassword = await bcrypt.compare(password, user.password);
        //console.log(matchPassword)
        if (!matchPassword) return res.status(401).send({ status: false, message: "Invalid password" });


        let token = jwt.sign(
            {
                userId: user._id.toString(),
                organization: "FunctionUp"
            },
            "functionup-group24-secretKey",
            { expiresIn: '24h' }

        );

        return res.status(200).send({ status: true, message: "User login successfull", data: { userid: user._id, token: token } });


    }
    catch (err) {
        return res.status(500).send(err.message);

    }
}

//===============================================================Get User============================================================

const getUserDetails = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) {
            return res.status(400)
                .send({ status: false, message: "UserId  Invalid" })
        }
        let userData = await userModel.findById({ _id: userId })

        if (!userData) return res.status(404)
            .send({ status: false, message: 'User Data Not Found' })

        return res.status(200).send({ status: true, message: 'User profile details', data: userData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//==================================================================Update User Profile===============================================
const updateUser = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
        let files = req.files

        let Users = await userModel.findOne({ _id: userId })

        if (!Users) { return res.status(404).send({ status: false, message: "No User Found" }) }

        if(!isValidRequestBody(data)) return res.status(400).send({status:false,message:"Please provide data in the request body"})
        let { fname, lname, email, phone, profileImage, password,address} = data

        if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "Body should not be empty" })

        // ==================================validation for userProfile==================================
if(fname){
        if (!isValidName(fname)) 
        return res.status(400).send({ status: false, message: "please write fname in correct way" })
}
if(lname){
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "please write lname in correct way" })
}
        // =================Email validation==========================
if(email){
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "please write email in correct way" })

        const checkEmail = await userModel.findOne({ email: email });
        if (checkEmail)
            return res.status(400)
                .send({ status: false, message: "This email is alredy exist" })
}

        // ========================Password Validation=================================
if(password){
        if (!isValidPass(password)) return res.status(400).send({ status: false, message: "please write password in correct way" })

        //-------------------password hashing-------------------
        const hashPassword = await bcrypt.hash(password, 10);
        data.password = hashPassword

}
        // ===========================phone Validation====================================
if(phone){
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "please write phone in correct way" })

        const checkPhone = await userModel.findOne({ phone: phone });
        if (checkPhone)
            return res.status(400)
                .send({ status: false, message: "This phone number is already exist " })
}

        // ====================================Profile image validation================================
if(profileImage){
        if (!isValid(profileImage)) return res.status(400).send({ status: false, message: "please write profileImage in correct way" })

        let uploadedImageURL = await uploadFile(files[0])
        data.profileImage = uploadedImageURL
}



        // ==========================Address validation================================
if(address){
        if (!isValid(address)) return res.status(400).send({ status: false, message: "please write address in correct way" })

        

        // =====================shipping address======================
        if (shipping) {
            const { street, city, pincode } = shipping;

            if (!isValidStreet(street))
                return res.status(400)
                    .send({ status: false, message: "street is not valid" })


            if (!isValidRequestBody(shipping))
                return res.status(400)
                    .send({ status: false, message: "Enter data into the shipping" })


            if (!isValidName(city))
                return res.status(400)
                    .send({ status: false, message: "city is not valid" })

            if (!pincode)
                return res.status(400)
                    .send({ status: false, message: "pincode is required" })
            if (typeof pincode === "string") {
                if (!isValidPincode(pincode))
                    return res.status(400)
                        .send({ status: false, message: "pincode is not valid" })
            }
        } 


        // ===================================billing address=========================
        if (billing) {

            if (!isValidRequestBody(billing))
                return res.status(400)
                    .send({ status: false, message: "Enter data into the billing" })

            const { street, city, pincode } = billing;

            if (!isValidStreet(street))
                return res.status(400)
                    .send({ status: false, message: "street is not valid" })


            if (!isValidName(city))
                return res.status(400)
                    .send({ status: false, message: "city is not valid" })


            if (!isValidPincode(pincode))
                return res.status(400)
                    .send({ status: false, message: "pincode is not valid" })
        }

    }

        const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { $set: data }, { new: true });

        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}




module.exports = { createUser, loginUser, getUserDetails, updateUser };