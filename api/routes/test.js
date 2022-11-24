const router = require('express').Router()
const controller = require('../controllers')

router.get("/", (req, res) => {
    controller.myTestController.testFunc(req, res);
})
module.exports = router;