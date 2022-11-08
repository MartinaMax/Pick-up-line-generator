const sql = require('mssql');

const config = require('config');
const con = config.get('dbConfig_UCN');

const Joi = require('joi');

class PickUpLine {
    constructor(pickuplineObj) {
        if(pickuplineObj.pickuplineid) {
            this.pickuplineid = pickuplineObj.pickuplineid;
        }
        this.pickuplinequote = pickuplineObj.pickuplinequote;
        if(pickuplineObj.accountid) {
            this.accountid = pickuplineObj.accountid;
        }
        if(pickuplineObj.themeid) {
            this.themeid = pickuplineObj.themeid;
        }
        if (pickuplineObj.theme) {
            if(pickuplineObj.themeid) {
                this.themeid = pickuplineObj.theme.themeid;
            }
            if(pickuplineObj.themename) {
                this.themename = pickuplineObj.theme.themename;
            }
            if(pickuplineObj.themedescr) {
                this.themedescr = pickuplineObj.theme.themedescr;
            }
        }
    }


    static validationSchema() {
        const schema = Joi.object({
            pickuplineid: Joi.number()
                .integer()
                .min(1),
            pickuplinequote: Joi.string()
                .max(255)
                .required(),
            accountid: Joi.number()
                .integer()
                .allow(null),
            theme: Joi.object({
                themeid: Joi.number()
                    .integer()
                    .min(1),
                themename: Joi.string()
                    .max(50),
                themedescr: Joi.string()
                    .max(255)
            })
        })
       
        return schema
    }
    

    static validate(pickuplineObj){
        const schema = PickUpLine.validationSchema();

        return schema.validate(pickuplineObj);
    }


    static readAll(queryObj) {
        return new Promise((resolve, reject) => {    
            (async () => { 
                try {
                    let queryString = `
                    SELECT *
                      FROM puplPickUpLineTheme PT
                        INNER JOIN puplPickUpLine P     
                        ON PT.FK_pickuplineid = P.pickuplineid 
                            INNER JOIN puplTheme T    
                            ON T.themeid = PT.FK_themeid
                    `;

                    let qcolumnname;
                    let qtype;
                    if (queryObj) {
                        switch (queryObj.query) {
                            case ('themename'):
                                qcolumnname = 'themename';
                                qtype = sql.NVarChar();
                                break;
                            default: break;
                        }

                        queryString += `
                            WHERE T.${qcolumnname} = @var
                        `;
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

        
                    const pickuplines = [];
                    result.recordset.forEach(record => {
                        const pickuplineWannabe = {
                            pickuplineid: record.pickuplineid,
                            pickuplinequote: record.pickuplinequote,
                            accountid: record.accountid,
                            theme: {
                                themeid: record.themeid,
                                themename: record.themename,
                                themedescr: record.themedescr
                            }
                             
                        }


                        const { error } = PickUpLine.validate(pickuplineWannabe);
                        if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, theme does not validate: ${pickuplineWannabe.themename}`, errorObj: error };


                        pickuplines.push(new PickUpLine(pickuplineWannabe));
                    })

                    resolve(pickuplines)

                } catch (err) {
                    reject(err);  
                }

                sql.close();   

            })();  
        })
    }


    static readByName(pickuplinequote) {
        return new Promise((resolve, reject) => { 
            (async () => { 
                try {
                    const pool = await sql.connect(con);

                    const result = await pool.request()
                        .input('pickuplinequote', sql.NVarChar(), pickuplinequote)
                        .query(`
                            SELECT *
                            FROM puplPickUpLine P
                            WHERE P.pickuplinequote = @pickuplinequote
                        `)
                    
                    
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, multiple pickuplinequotes: ${pickuplinequote}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Pickup line not found by pickuplinequote: ${pickuplinequote}`, errorObj: {} };
                    
                  
                    
                    const pickuplineWannabe = {
                        pickuplineid: result.recordset[0].pickuplineid,
                        accountid: result.recordset[0].accountid,
                        pickuplinequote: result.recordset[0].pickuplinequote
                    }
                   
                    const { error } = PickUpLine.validate(pickuplineWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, pickupline does not validate: ${pickuplineWannabe.pickuplineid}`, errorObj: error };

                    resolve(new PickUpLine(pickuplineWannabe))

                } catch (err) {
                    reject(err) 
                }

                sql.close();    

            })();  
        })
    }


    static readById(pickuplineid) {
        return new Promise((resolve, reject) => {  
            (async () => { 
                try {
                    const pool = await sql.connect(con);

                    const result = await pool.request()
                        .input('pickuplineid', sql.Int(),pickuplineid)
                        .query(`
                            SELECT *
                            FROM puplPickUpLineTheme PT
                                INNER JOIN puplPickUpLine P     
                                ON PT.FK_pickuplineid = P.pickuplineid 
                                    INNER JOIN puplTheme T    
                                    ON T.themeid = PT.FK_themeid
                            WHERE P.pickuplineid = @pickuplineid
                        `)

                    
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple pickuplines with pickuplineid: ${pickuplineid}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Pickupline not found by pickuplineid: ${pickuplineid}`, errorObj: {} };

                    const pickuplineWannabe = {
                        pickuplineid: result.recordset[0].pickuplineid,
                        accountid: result.recordset[0].accountid,
                        pickuplinequote: result.recordset[0].pickuplinequote,
                        theme: {
                            themeid: result.recordset[0].themeid,
                            themename: result.recordset[0].themename
                        }
                    }

                    const { error } = PickUpLine.validate(pickuplineWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, pickupline does not validate: ${pickuplineWannabe.pickuplineid}`, errorObj: error };


                    resolve(new PickUpLine(pickuplineWannabe))

                } catch (err) {
                    reject(err)
                }

                sql.close();  

            })();  
        })
    }


    create() {
        return new Promise((resolve, reject) => {  
            (async () => { 
                try {
                    const pickupline = await PickUpLine.readByName(this.pickuplinequote);

                    
                    const error = { statusCode: 409, errorMessage: `Pick up line already exists`, errorObj: {} }
                    return reject(error);   

                } catch (err) {
                    if (!err.statusCode || err.statusCode != 404) {
                        return reject(err); 
                    }
                }

                try {
                    const pool = await sql.connect(con);


                    const resultPickUpLine = await pool.request()
                        .input('accountid', sql.Int(), this.accountid)
                        .input('pickuplinequote', sql.NVarChar(), this.pickuplinequote)
                        .query(`
                        INSERT INTO puplPickUpLine
                            ( [FK_accountid], [pickuplinequote])
                        VALUES
                            (@accountid, @pickuplinequote);
                        SELECT * 
                        FROM puplPickUpLine P
                        WHERE P.pickuplinequote = @pickuplinequote
                        `)

                    if (resultPickUpLine.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO pickupline table failed`, errorObj: {} }
                    
                    const pickuplinequote = resultPickUpLine.recordset[0].pickuplinequote;
                    
                    sql.close();

                    const pickupline = await PickUpLine.readByName(this.pickuplinequote);

                    resolve(pickupline);

                } catch (err) {
                    reject(err);   
                }

                sql.close();    

            })();  
        })
    }


    update() {
        return new Promise((resolve, reject) => { 
            (async () =>  {
                try {
                    let tmpResult;
                    tmpResult = await PickUpLine.readById(this.pickuplineid);
                    
                    const pool = await sql.connect(con);

                    tmpResult = await pool.request()
                        .input('pickuplineid', sql.Int(), this.pickuplineid)
                        .input('accountid', sql.Int(), this.accountid)
                        .input('pickuplinequote', sql.NVarChar(), this.pickuplinequote)
                        .query(`
                            UPDATE puplPickUpLine
                            SET pickuplinequote = @pickuplinequote
                            WHERE pickuplineid = @pickuplineid
                        `)

                    sql.close();

                    const pickupline = await PickUpLine.readById(this.pickuplineid);

                    resolve(pickupline);
                    
                } catch (err) {
                    reject(err);
                }
                sql.close()
            })();
        })
    }

    
    delete() {
        return new Promise((resolve, reject) => {  
            (async () => {  
                
                try {
                    const pickupline = await PickUpLine.readById(this.pickuplineid);

                    const pool = await sql.connect(con);

                   let tmpResult;
                   tmpResult = await pool.request()    
                        .input('pickuplineid', sql.Int(), this.pickuplineid)
                        .query(`
                            DELETE FROM puplPickUpLineTheme
                            WHERE FK_pickuplineid = @pickuplineid
                        `)

                    tmpResult = await pool.request()
                        .input('pickuplineid', sql.Int(), this.pickuplineid)
                        .query(`
                            DELETE FROM puplPickUpLine
                            WHERE pickuplineid = @pickuplineid
                        `)

                    resolve(pickupline);

                } catch (err) {
                    reject(err);
                }

                sql.close();    

            })();   
        })
    }

}


module.exports = PickUpLine;
