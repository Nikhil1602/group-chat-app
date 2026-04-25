exports.uploadFile = async (req, res) => {

    try {

        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

        res.json({
            url,
            fileName: file.originalname,
            mimeType: file.mimetype
        });

    } catch (err) {

        console.log(err);
        res.status(500).json({ message: "Upload failed" });

    }

};