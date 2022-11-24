const { sequelize } = require("../../config/database")
const sha1 = require("sha1")
const jwt = require('jsonwebtoken');
// const environment = "development";
// const configDB = require("../../config/config");
// const { Sequelize, DataTypes } = require("sequelize");

// const db = configDB[environment];
// const sequelize = new Sequelize(db.database, db.username, db.password, db);
exports.create = async (req, res) => {

  try {
    const { login_id, user_password, browser_id } = req.body
    console.log("reqqq", req.body)
    let Sqlquery = `SELECT func_login_authentication('${login_id}','${sha1(user_password)}','${browser_id}')`;
    if (!(login_id && user_password)) {
      res.status(406).json("All Inputs are required")
    }
    else {
      let dataReponse = await sequelize.query(Sqlquery);
      let splitData = dataReponse[0][0].func_login_authentication.split(":")
      let user_ID = splitData[1];
      let AfterSuccessQuery = `select func_get_session_id('${user_ID}')`
      let afterSuccessResponse = await sequelize.query(AfterSuccessQuery);
      const accessToken = await setJWT(user_ID, afterSuccessResponse[0][0].func_get_session_id);
      res.status(200).send({
        data: splitData[0],
        user_Id: user_ID,
        session_id: afterSuccessResponse[0][0].func_get_session_id,
        accessToken,
      })
    }
  }
  catch (err) {
    res.status(400).json({ data: "Invalid Username/Password" })
  }
}
function setJWT(user_id, session_id) {
  return jwt.sign({ user_id, session_id },
    process.env.ACCESS_TOKEN,
    // { expiresIn: "1h" }
  )
}