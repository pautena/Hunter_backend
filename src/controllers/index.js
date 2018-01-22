

const express = require('express');
const router = express.Router();

router.use('/bounties',require('./BountyController'));

module.exports = router;
