const jwt = require('jsonwebtoken');
const config = require('config');
const jwtKey = config.get('jwt_secret_key');


module.exports = (req, res, next) => {

    try {
        const token = req.header('x-authentication-token');
        if (!token) throw { statusCode: 401, errorMessage: `Access denied: no token provided`, errorObj: {} }

        const account = jwt.verify(token, jwtKey);  

        req.account = account;

        next();

    } catch (err) { 
        if (err.name == 'JsonWebTokenError') {  
            return res.status(401).send(JSON.stringify({ statusCode: 401, errorMessage: `Access denied: invalid token`, errorObj: {} }));
        }
        if (err.statusCode) {   
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));  
    }
}