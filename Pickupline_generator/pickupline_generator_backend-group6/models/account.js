const sql = require('mssql');
const config = require('config');
const con = config.get('dbConfig_UCN');

const Joi = require('joi');
const bcrypt = require('bcryptjs');


class Account {
    constructor(accountObj) {
        if (accountObj.accountid) {
            this.accountid = accountObj.accountid;
        }
        this.email = accountObj.email;
        if (accountObj.profileid) {
            this.profileid = accountObj.profileid;
        }
        if (accountObj.role) {
            this.role = {
                roleid: accountObj.role.roleid
            }
            if (accountObj.role.rolename) {
                this.role.rolename = accountObj.role.rolename;
            }
        }
    }


    static validationSchema() {
        const schema = Joi.object ({
            accountid: Joi.number()
                .integer()
                .min(1),
            email: Joi.string()
                .email()
                .max(255)
                .required(),
            profileid: Joi.number()
                .integer()
                .allow(null),
            role: Joi.object({
                roleid: Joi.number()
                    .integer()
                    .min(1)
                    .required(),
                rolename: Joi.string()
                    .max(50)
            })
        })
        return schema;
    }


    static validate(accountObj) {
        const schema = Account.validationSchema();

        return schema.validate(accountObj);
    }


    static validateCredentials(credentialsObj) {
        const schema = Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .min(3)
                .required()
        })

        return schema.validate(credentialsObj);
    }


    static checkCredentials(credentialsObj) {
        return new Promise((resolve, rejects) => {
            (async () => {
                try {
                    const account = await Account.readByEmail(credentialsObj.email);
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('accountid', sql.Int(), account.accountid)
                        .query(`
                            SELECT *
                            FROM puplPassword p
                            WHERE p.FK_accountid = @accountid    
                        `)
                    
                    if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt DB, corrupted password information on accountid: ${account.accountid}`, errorObj: {} };
                    
                    const hashedpassword = result.recordset[0].hashedpassword;
                    
                    const credentialsOK = bcrypt.compareSync(credentialsObj.password, hashedpassword);  

                    if (!credentialsOK) throw { statusCode: 401, errorMessage: `Invalid account email or password`, errorObj: {} };
                    
                    resolve(account);
                    
                } catch (err) {
                    rejects(err);
                }
                
                sql.close();

            })();
        })
    }


    static readByEmail(email) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('email', sql.NVarChar(), email)
                        .query(`
                            SELECT *
                            FROM puplAccount ac
                                INNER JOIN puplRole r
                                ON ac.FK_roleid = r.roleid
                            WHERE ac.email = @email
                        `)

                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple accounts with email: ${email}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Account not found by email: ${email}`, errorObj: {} };


                    const accountWannabe = {
                        accountid: result.recordset[0].accountid,
                        email: result.recordset[0].email,
                        profileid: result.recordset[0].profileid,
                        role: {
                            roleid: result.recordset[0].roleid,
                            rolename: result.recordset[0].rolename
                        }
                    }

                    const { error } = Account.validate(accountWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, account does not validate: ${accountWannabe.accountid}`, errorObj: error };
                
                    resolve(new Account(accountWannabe));

                }catch (err) {
                 reject(err);
                }

                sql.close();
            
            })();
        })
    }


    static readById(accountid) {
        return new Promise((resolve, reject) => {  
            (async () => {
                try {
                    const pool = await sql.connect(con);    
                    const result = await pool.request()     
                        .input('accountid', sql.Int(), accountid) 
                        .query(`    
                            SELECT *
                            FROM puplAccount ac
                                INNER JOIN puplRole r
                                ON r.FK_roleid = r.roleid
                            WHERE ac.accountid = @accountid
                        `)

                    
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple accounts with accountid: ${accountid}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Account not found by accountid: ${accountid}`, errorObj: {} };

                
                    const accountWannabe = {
                        accountid: result.recordset[0].accountid,
                        email: result.recordset[0].email,
                        profileid: result.recordset[0].profileid,
                        role: {
                            roleid: result.recordset[0].roleid,
                            rolename: result.recordset[0].rolename
                        }
                    }
   
                    const { error } = Account.validate(accountWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, account does not validate: ${accountWannabe.accountid}`, errorObj: error };

                    resolve(new Account(accountWannabe));

                } catch (err) {
                    reject(err);    
                }

                sql.close();    

            })();   
        })
    }


    static readAll(queryObj) {
        return new Promise((resolve, reject) => {   
            (async () => {  
                try {
                    let queryString = `
                        SELECT *
                        FROM puplAccount ac
                                INNER JOIN puplRole r
                                ON r.FK_roleid = r.roleid
                    `;

                    let qcolumnname;
                    let qtype;
                    if (queryObj) {
                        switch (queryObj.query) {
                            case ('email'):
                                qcolumnname = 'email';
                                qtype = sql.NVarChar();
                                break;
                            case ('roleid'):
                                qcolumnname = 'FK_roleid';
                                qtype = sql.Int();
                                break;
                            default: break;
                        }

                        queryString += `
                            WHERE ac.${qcolumnname} = @var
                        `   
                    }

                    const pool = await sql.connect(con);    

                    
                    let result;
                    if (queryObj) { 
                        result = await pool.request()
                            .input('var', qtype, queryObj.value)   
                            .query(queryString)     
                    } else {
                        result = await pool.request()
                            .query(queryString)     
                    }

                    const accounts = [];
                    result.recordset.forEach(record => {
    
                        const accountWannabe = {
                            accountid: record.accountid,
                            email: record.email,
                            profileid: record.profileid,
                            role: {
                                roleid: record.roleid,
                                rolename: record.rolename
                            }
                        }

                        
                        const { error } = Account.validate(accountWannabe);
                        if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, account does not validate: ${accountWannabe.accountid}`, errorObj: error };

                      
                        accounts.push(new Account(accountWannabe));
                    })

                    resolve(accounts);

                } catch (err) {
                    reject(err);
                }

                sql.close();

            })();   
        })

    }


    create(password) {
        return new Promise((resolve, reject) => {   
            (async () => { 
                try {
                    const account = await Account.readByEmail(this.email);  
                   
                    const error = { statusCode: 409, errorMessage: `Account already exists`, errorObj: {} }
                    return reject(error);  

                } catch (err) { 

                    if (!err.statusCode || err.statusCode != 404) {
                        return reject(err);    
                    }
                }

                try {   
                    const pool = await sql.connect(con);    

                    if (!this.profileid){
                        this.profileid = null;
                    }

                    const resultAccount = await pool.request()  
                        .input('email', sql.NVarChar(), this.email)            
                        .query(`
                            INSERT INTO puplAccount
                                ([email, [profileid])
                            VALUES
                                (@email, @profileid);
                            SELECT *
                            FROM puplAccount ac
                            WHERE ac.accountid = SCOPE_IDENTITY()
                        `)  

                    if (resultAccount.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO account table failed`, errorObj: {} }

                   

                    const hashedpassword = bcrypt.hashSync(password);  
                    const accountid = resultAccount.recordset[0].accountid;  

                    const resultPassword = await pool.request()     
                        .input('accountid', sql.Int(), accountid)       
                        .input('hashedpassword', sql.NVarChar(), hashedpassword) 
                        .query(`
                            INSERT INTO puplAccount
                                ([FK_accountid], [hashedpassword])
                            VALUES
                                (@accountid, @hashedpassword);
                            SELECT *
                            FROM puplPassword p
                            WHERE p.FK_accountid = @accountid
                        `)  

                    if (resultPassword.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO account table failed`, errorObj: {} }
                    

                    sql.close();    

                    const account = await Account.readByEmail(this.email);  

                    resolve(account);  
                    
                } catch (err) { 
                    reject(err); 
                }

                sql.close();    
                

            })(); 
        })
    }

    
}

module.exports = Account;
