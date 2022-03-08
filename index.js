require("dotenv").config();

const express = require("express");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");

const app = express();

// const limiter = rateLimit({
//   // ...
//   max: async (request, response) => {
//     // if (await isPremium(request.user)) return 10;
//     console.log(request);
//     return 10;
//     // else return 5;
//   },
// });

// app.use(limiter);

//using helmet for security
app.use(helmet());

//use cors
app.use(cors());

//use body parser
app.use(express.json());

//access cookie easy
app.use(cookieParser());

//csrf protection
app.use(csrf({ cookie: { httpOnly: true, secure: false } }));

//get csrf token
app.get("/csrf", (req, res) => {
  return res.status(200).send({ status: true, csrfToken: req.csrfToken() });
});

//routes
const sliderRoute = require("./routes/sliderRoute");

//use routes
app.use("/slider", sliderRoute);

//if any syntax error occurs ------ do at last
app.use(function (err, req, res, next) {
  if (err.code === "EBADCSRFTOKEN") {
    // handle CSRF token errors here
    res.status(403);
    return res.json({ status: false, message: "Not a valid address." });
  }

  return res
    .status(err.status || 500)
    .json({ status: false, message: "Syntax Error!" });
});

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
