require("dotenv").config();

const express = require("express");
const cors = require("cors");
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

//use cors
app.use(cors());

//use body parser
app.use(express.json());

//routes
const sliderRoute = require("./routes/sliderRoute");

//use routes
app.use("/slider", sliderRoute);

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
