const express = require('express');
const bodyParser = require('body-parser');

const morgan = require('morgan')
const cors = require('cors')
const app = express();
require('dotenv').config()


//parse application json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

//routes
app.use('/admin', require('./routes/admin'));
app.use('/petugas', require('./routes/petugas'));


app.listen(process.env.PORT, () => {
    console.log(`⚡Server started on port ${process.env.PORT} ⚡`);    
});