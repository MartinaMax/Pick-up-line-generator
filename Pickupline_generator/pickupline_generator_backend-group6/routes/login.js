const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const config = require('config');
const jwtKey = config.get('jwt_secret_key');

const Account = require('../models/account');

//member:
// POST /api/accounts/login
//  payload: {email, password}

router.post('/', async (req,res) => {
    try {
        const { error } = Account.validateCredentials(req.body);
        if (error) throw { statusCode: 400, errorMessage: 'Badly formatted request', errorObj: error}

        const account = await Account.checkCredentials(req.body);

        const token = jwt.sign(JSON.stringify(account), jwtKey);

        res.header('x-authentication-token', token);

        return res.send(JSON.stringify(account));

    } catch (err) {
        if (err.statusCode == 400) return res.status(err.statusCode).send(JSON.stringify(err));
      
        const standardError = {statusCode: 401, errorMessage: `Invalid account email or password`, errorObj: {}}
        return res.status(401).send(JSON.stringify(standardError));
    }
})

module.exports = router;