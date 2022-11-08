module.exports = (req, res, next) => {
    try {
        if (req.account.authorised) return next();

        throw { statusCode: 401, errorMessage: `Access denied: authorisation failed`, errorObj: {} }

    } catch (err) { 
        if (err.statusCode) {  
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   

    }
}