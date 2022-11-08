module.exports = (req, res, next) => {

    const authorisedRole = 'member'; 

    try {
        if (!req.account) throw { statusCode: 401, errorMessage: `Access denied: authentication required`, errorObj: {} }

        if (req.account.role && req.account.role.rolename == authorisedRole) { 
            req.account.authorised = true;  
            return next();
        }
        return next()

    } catch (err) { 
        if (err.statusCode) { 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));  
    }
}