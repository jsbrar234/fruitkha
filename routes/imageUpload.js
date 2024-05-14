const multer = require("multer")
var express = require('express');
const { uploadStorage } = require("../middleware/multer");
var router = express.Router();



// Single file
router.post("/single", uploadStorage.single("file"), (req, res) => {
    return res.send({
        message: "SINGLE FILE",
        data: req.file
    })
})

module.exports = router


