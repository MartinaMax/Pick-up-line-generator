//Defining the endpoints GET, POST, PUT, DELETE

const express = require('express');
const router = express.Router();

const _ = require('lodash');

const auth = require('../middleware/authenticate');
const member = require('../middleware/member');
const check = require('../middleware/checkauthorisation');

const Joi = require('joi');
const PickUpLine = require('../models/pickupline');


// GET /api/pickuplines/random
router.get('/random', async(req, res) => {
    res.header('Content-type', 'application/json');
    try {
        const schema = Joi.object({
            themename: Joi.string()
                .max(50)
        })

        const { error } = schema.validate(req.query);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }

        const pickupLinesArrays = [];

        const queryKeyValuePairs = Object.entries(req.query);

        for await ([key, value] of queryKeyValuePairs) {
            const pickupLinesArray = await PickUpLine.readAll({ query: key, value: value });
            pickupLinesArrays.push(pickupLinesArray);
        }

        let pickuplines = [];
        if (queryKeyValuePairs.length > 0) {    

            if (pickupLinesArrays.length == 1) {
                pickuplines = Array.from(pickupLinesArrays[0]);    
            } else {
                const pickupLinesArray = pickupLinesArrays.pop();  
                pickupLinesArray.forEach(pickupline => {    
                    let intersect = true;
                    pickupLinesArrays.forEach(pickupLArray => {  
                        const found = pickupLArray.find(pickupL => pickupL.pickuplineid == pickupline.pickuplineid);   
                        intersect = intersect && found; 
                    })

                    if (intersect) pickuplines.push(pickupline);
                })
            }
        } else { 
            pickuplines = await PickUpLine.readAll(); 
        }

            pickuplines.sample = function(){
            return this[Math.floor(Math.random()*this.length)];
        };

        return res.send(JSON.stringify(pickuplines.sample()));

    } catch (err) {
        if (err.statusCode) {   
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));  
    }

})


// GET /api/pickuplines?themename= 
// query: { themename }
router.get('/', async (req, res) => {
    
    res.header('Content-type', 'application/json');
    try {
        const schema = Joi.object({
            themename: Joi.string()
                .max(50)
        })

        const { error } = schema.validate(req.query);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }

        const pickupLinesArrays = [];

        const queryKeyValuePairs = Object.entries(req.query);

        for await ([key, value] of queryKeyValuePairs) {
            const pickupLinesArray = await PickUpLine.readAll({ query: key, value: value });
            pickupLinesArrays.push(pickupLinesArray);
        }

        let pickuplines = [];
        if (queryKeyValuePairs.length > 0) {    

            if (pickupLinesArrays.length == 1) {
                pickuplines = Array.from(pickupLinesArrays[0]);    
            } else {
                const pickupLinesArray = pickupLinesArrays.pop();  
                pickupLinesArray.forEach(pickupline => {    
                    let intersect = true;
                    pickupLinesArrays.forEach(pickupLArray => {  
                        const found = pickupLArray.find(pickupL => pickupL.pickuplineid == pickupline.pickuplineid);   
                        intersect = intersect && found; 
                    })

                    
                    if (intersect) pickuplines.push(pickupline);
                })
            }
        } else {    
            pickuplines = await PickUpLine.readAll();   
        }
        pickuplines.sample = function(){
            return this[Math.floor(Math.random()*this.length)];
        };

        return res.send(JSON.stringify(pickuplines.sample()));

        
    } catch (err) {
        if (err.statusCode) {   
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));  
    }

})


// POST  [auth, member, check] /api/pickuplines
router.post('/', [auth, member, check], async (req, res) => {
    try {
        const { error } = PickUpLine.validate(req.body);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }

        const pickupLToBeSaved = new PickUpLine(req.body);

        if (req.body.pickuplinequote) {
            pickupLToBeSaved.pickuplinequote = req.body.pickuplinequote;
        }

        const pickupline = await pickupLToBeSaved.create();

        return res.send(JSON.stringify(pickupline));

    } catch (err) {
        if (err.statusCode) { 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err)); 
    }

})


//PUT [auth, member, check] /api/pickuplines/:pickuplineid
router.put('/:pickuplineid', [auth, member, check], async (req, res) => {
    try {
        const schema = Joi.object ({
            pickuplineid: Joi.number()
                .integer()
                .min(1)
                .required(),
        })

        let validationResult = schema.validate(req.params);
        if (validationResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validationResult.error }

        const pickuplineById = await PickUpLine.readById(req.params.pickuplineid);

        if (req.body.pickuplinequote) {
            pickuplineById.pickuplinequote = req.body.pickuplinequote;
        }

        validationResult = PickUpLine.validate(pickuplineById);
        if (validationResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validationResult.error }

        let pickuplineByName;
        try {
            pickuplineByName = await PickUpLine.readByName(pickuplineById.pickupline);

        } catch (innerErr) {
            if (innerErr.statusCode == 404) {
                pickuplineByName = pickuplineById
            } else {
                throw innerErr;
            }
        }

        if (pickuplineById.pickuplineid != pickuplineByName.pickuplineid) throw { statusCode: 403, errorMessage: `Cannot update pickupline with id: ${pickuplineById.pickuplinequote}`, errorObj: {} }
        
        const pickupline = await pickuplineById.update();

        return res.send(JSON.stringify(pickupline));

    }catch (err) {
        if (err.statusCode) {   
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));

    }
})


// DELETE [auth, member,check] /api/pickuplines/:pickuplineid
router.delete('/:pickuplineid', [auth, member, check], async (req, res) => {
    try{
        const schema = Joi.object({
            pickuplineid: Joi.number()
                .integer()
                .min(1)
                .required()
        })

        const { error } = schema.validate(req.params);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }

        const pickupline = await PickUpLine.readById(req.params.pickuplineid);

        const deletePickUpLine = await pickupline.delete();
        return res.send(JSON.stringify(deletePickUpLine));
        
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));
    }
})


module.exports = router;
