const express = require('express');
const { tokenizeCode } = require('../Controller/LexerController');

const router = express.Router();

// POST /api/tokenize  with body { "code": "pipeline process_data\n..." }
router.post('/tokenize', tokenizeCode);

module.exports = router;
