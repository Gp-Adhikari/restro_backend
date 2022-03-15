require("dotenv").config();

const express = require("express");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoose = require("mongoose");
// const rateLimit = require("express-rate-limit");

//connecting to mongodb
mongoose.connect(process.env.URI);

//on connection
mongoose.connection.on("connected", () => {
  //   console.log("connected to database.");
});

//on error
mongoose.connection.on("error", () => {
  console.log("Error connecting to database!");
});

const app = express();

//using helmet for security
app.use(helmet());

////////////////////////////////////////////////////////////////////////////
//cors
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "*"],
    // exposedHeaders: ["set-cookie"],
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

app.use((req, res, next) => {
  res.removeHeader("Cross-Origin-Resource-Policy");
  res.removeHeader("Cross-Origin-Embedder-Policy");
  next();
});

///////////////////////////////////////////////////////////////////////////////////////

//use body parser
app.use(express.json());

//access cookie easy
app.use(cookieParser());

//limit file size
app.use(express.json({ limit: "50mb" }));

//csrf protection
app.use(csrf({ cookie: { httpOnly: true, secure: false } }));

//require models
require("./models/RefreshToken");
require("./models/Admin");
require("./models/Otp");
require("./models/PageVisit");
require("./models/TotalVisits");

//get csrf token
app.get("/csrf", (req, res) => {
  return res.status(200).send({ status: true, csrfToken: req.csrfToken() });
});

const PageVisit = mongoose.model("PageVisit");
const TotalVisit = mongoose.model("TotalVisit");

app.get("/", (req, res) => {
  const date =
    new Date().getDate() +
    "-" +
    (new Date().getMonth() + 1) +
    "-" +
    new Date().getFullYear();

  //total visit counter
  TotalVisit.find({}, (err, data) => {
    try {
      const id = String(data[0]._id);
      TotalVisit.findByIdAndUpdate(
        `${id}`,
        {
          visit: parseInt(data[0].visit) + 1,
        },
        (err, data) => {}
      );
    } catch (error) {
      TotalVisit({
        visit: 1,
      }).save();
    }
  });
  PageVisit.find({}, (err, data) => {
    try {
      let dataFound = false;

      //search if today's counter record exists
      data.map((visitsPerDay) => {
        if (
          parseInt(new Date().getDate()) ===
          parseInt(visitsPerDay.createdAt.split("-")[0])
        ) {
          //if today's counter record exists set data found to true
          dataFound = true;
          //update the counter by 1
          PageVisit.findByIdAndUpdate(
            `${visitsPerDay._id}`,
            {
              counter: visitsPerDay.counter + 1,
            },
            (err, data) => {}
          );
        }
      });

      //if the counter field for today doesnt exists
      if (!dataFound) {
        const visits = new PageVisit({
          counter: 1,
          createdAt: date,
        });

        visits.save();
      }
    } catch (error) {}
    return res.status(200).json({ status: true, message: "Welcome!" });
  });
});

//routes
const sliderRoute = require("./routes/sliderRoute");
const authRoute = require("./routes/authRoute");

//use routes

app.use("/auth", authRoute);
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

app.use("*", (req, res) => {
  res.status(404).json({ status: false, message: "Page not found!" });
});

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
