const s3 = require("../utils/s3");

exports.uploadFile = async (req, res) => {
    try {

        const file = req.file;

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${Date.now()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        const data = await s3.upload(params).promise();

        res.json({
            url: data.Location
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Upload failed" });
    }
};