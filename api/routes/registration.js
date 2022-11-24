const router = require('express').Router()
const controller = require('../controllers')
const { fileUploader, authenticate } = require("../utils/helper");
router.post("/:Controller", authenticate, (req, res) => {
    let myController = req.params.Controller;
    switch (myController) {
        case "user": controller.Register.create(req, res); break;
    }
})
module.exports = router;