const router = require('express').Router()
const controller = require('../controllers')
const multer = require('multer');
const { authenticate } = require('../utils/helper');

// Multer Start
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './Uploads/')
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '_' + file.originalname
        console.log({ file });
        cb(null, fileName);
    },
})

const upload = multer({ storage }).single('file')
// Multer End

router.post("/:Controller", upload, authenticate, (req, res) => {
    let myController = req.params.Controller;
    switch (myController) {
        // case "file": controller.FileUpload.upload(req, res); break;
        case "customerComm": controller.CustomerCommunication.create(req, res); break;
        case "customerComm1": controller.CustomerCommunication.getAll(req, res); break;
    }
})

router.get("/:Controller/:Id", authenticate, (req, res) => {
    let myController = req.params.Controller;
    switch (myController) {
        // case "file": controller.FileUpload.upload(req, res); break;
        case "customerComm": controller.CustomerCommunication.getOne(req, res); break;
    }

})

module.exports = router;