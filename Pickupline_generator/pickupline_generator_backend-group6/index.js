const express = require('express');
const app = express();

const env = require('dotenv').config();
const config = require('config');

const cors = require('cors');

const resJSON = require('./middleware/resJSON');

const login = require('./routes/login');  
const pickuplines = require('./routes/pickuplines');

app.use(express.json());
app.use(resJSON); 

const corsOptions = {
    exposedHeaders: ['x-authentication-token']                                      
}
app.use(cors(corsOptions));

app.use('/api/login', login);
app.use('/api/pickuplines', pickuplines);  


app.listen(config.get('port'), () => console.log(`Listening on port ${config.get('port')}...`));
