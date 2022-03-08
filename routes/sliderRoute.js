const express = require("express");
const { escape } = require("mysql");

const config = require("../config/databaseConfig");
const connection = config.connection;

const router = express.Router();

//get slider content
router.get("/", (req, res) => {
  try {
    //check if slider table exists
    connection.query(
      "SELECT count(*) FROM information_schema.TABLES WHERE (TABLE_SCHEMA = '" +
        process.env.DB_DATABASE +
        "') AND (TABLE_NAME = 'slider')",
      (err, result) => {
        //if error
        if (err || result === undefined) {
          return res.json({ status: false, message: "Something went wrong!" });
        }

        //if count for table is null or 0, create table
        if (result[0]["count(*)"] === 0) {
          //creating the table
          connection.query(
            "CREATE TABLE slider (id VARCHAR(255) PRIMARY KEY DEFAULT (uuid()), title VARCHAR(255))",
            (err, result) => {
              //if error, return error
              if (err) {
                return res.json({
                  status: false,
                  message: "Something went wrong!",
                });
              }
              //table created successfully
            }
          );
        }

        //if the table exists
        connection.query("SELECT * from slider", (err, rows) => {
          if (err) {
            return res.json({
              status: false,
              message: "Something went wrong!",
            });
          }

          return res.status(200).json({
            status: true,
            slider: rows,
          });
        });
      }
    );
  } catch (error) {
    return res.json({ status: false, message: "Something went wrong!" });
  }
});

//add slider content
router.post("/", (req, res) => {
  try {
    //insert title into slider table
    connection.query(
      `INSERT INTO slider (title) VALUES (${escape(req.body.title)})`,
      (err, result) => {
        //if error
        if (err) {
          return res.json({ status: false, message: "Something went wrong!" });
        }

        //if success
        return res.status(200).json({
          status: true,
          message: "Slider content added successfully!",
        });
      }
    );
  } catch (error) {
    return res.json({ status: false, message: "Something went wrong!" });
  }
});

//update slider content
router.put("/:id", (req, res) => {
  try {
    //update title in slider table
    connection.query(
      "UPDATE slider SET title = " +
        escape(req.body.title) +
        " WHERE id = " +
        escape(req.params.id),
      (err, result) => {
        //if error
        if (err) {
          return res.json({ status: false, message: "Something went wrong!" });
        }

        //check if updated result is 0
        if (result.affectedRows === 0) {
          return res.json({
            status: false,
            message: "Slider content not found!",
          });
        }

        //if success
        return res.status(200).json({
          status: true,
          message: "Slider content updated successfully!",
        });
      }
    );
  } catch (error) {
    return res.json({ status: false, message: "Something went wrong!" });
  }
});

//remove slider content
router.delete("/:id", (req, res) => {
  try {
    //delete slider content
    connection.query(
      "DELETE FROM slider WHERE id = " + escape(req.params.id),
      (err, result) => {
        //if error
        if (err) {
          return res.json({ status: false, message: "Something went wrong!" });
        }

        //check if updated result is 0
        if (result.affectedRows === 0) {
          return res.json({
            status: false,
            message: "Slider content not found!",
          });
        }

        //if success
        return res.status(200).json({
          status: true,
          message: "Slider content deleted successfully!",
        });
      }
    );
  } catch (error) {
    return res.json({ status: false, message: "Something went wrong!" });
  }
});

module.exports = router;
