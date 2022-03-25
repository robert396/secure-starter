require('dotenv').config();
const express = require('express');
const session = require('cookie-session');
const helmet = require('helmet');
const hpp = require('hpp');
const csurf = require('csurf');
const passport = require('./middleware/passport');

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

/* Register Middleware */
app.use(helmet());
app.use(hpp());
app.use(session({
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    secure: isProduction,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hrs
}));
app.use(csurf());
app.use(passport.initialize());

/* Register Routes  */
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;