const express = require('express');

const router = express.Router();

// Health check for v1 routes
router.get('/', (req, res) => {
  res.send({
    status: 'success',
    time: new Date().getTime(),
  });
});

module.exports = router;
