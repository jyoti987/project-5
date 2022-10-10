const express = require('express');
const route =require("./route/route.js");
const mongoose  = require('mongoose');

const app = express();

app.use(express.json()); 


mongoose.connect("mongodb+srv://ShailyTripathi:ShailyCompass2125@shailytripathi.ifjbsp5.mongodb.net/group24Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


 app.use('/', route);





app.listen(3000, function () {
    console.log('Express app running on port ' + (3000))
});
