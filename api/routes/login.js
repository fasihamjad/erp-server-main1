const router = require('express').Router()
const controller = require('../controllers')

router.post("/:Controller", (req, res) => {
    let myController = req.params.Controller;
    switch (myController) {
        case "user": controller.Login.create(req, res); break;
    }
})
module.exports = router;