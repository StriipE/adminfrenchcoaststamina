/**
 * Created by Ewen Auffret on 24/10/2016.
 */
var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', function (req,res) {
    res.render('index');
})

module.exports = router;