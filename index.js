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
// const routesUser = require('./routes/user');
// const routesWeb = require('./routes/web');

// routesAdmin(app);
// routesUser(app);
// routesWeb(app);



app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
    console.log(process.env.BASE_URL)
});