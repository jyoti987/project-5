const express = require('express');
const route = require("./routes/route.js");
const mongoose = require('mongoose');
const multer = require("multer");
const { AppConfig } = require('aws-sdk');

const app = express();

// to parse json data from request object
app.use(express.json());

app.use(multer().any());

// connect to database
mongoose.connect("mongodb+srv://ShailyTripathi:ShailyCompass2125@shailytripathi.ifjbsp5.mongodb.net/group24Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))


app.use('/', route);

app.use("/*", function (req, res) {
    res.status(400).send({ status: false, message: "The api you request is not available" })
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
