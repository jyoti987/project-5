const aws=require("aws-sdk")

aws.config.update({
  accessKeyId: "AKIAY3L35MCRZNIRGT6N",
  secretAccessKey: "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",
  region: "ap-south-1"
})

const uploadFile = async (file) => {
  return new Promise(function(resolve, reject){

    const s3 = new aws.S3({appVersion : '2006-03-01'})

    const uploadParams = {
      ACL : "public-read",                //access Controller
      Bucket : "classroom-training-bucket",  // bucket Name
      Key : "abc-aws/" + file.originalname,  //add file in abc-aws folder with requested filename
      Body : file.buffer                     //data or file data present in file.buffer
    }
// {
//   fieldname: 'productImage',
//   originalname: 'black-colorblock-windcheater.webp',
//   encoding: '7bit',
//   mimetype: 'image/webp',
//   buffer: <Buffer 52 49 46 46 36 37 01 00 57 45 42 50 56 50 38 58 0a 00 00 00 20 00 00 00 37 04 00 45 05 00 49 43 43 50
// 0a 1b 00 00 00 00 1b 0a 6c 63 6d 73 02 30 00 00 ... 79628 more bytes>,
//   size: 79678
// }

    s3.upload(uploadParams, function(err, data){

      if(err) return reject ({error : err})
      return resolve(data.Location)
    })

  }
  )}

module.exports={uploadFile}