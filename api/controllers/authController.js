//DL Duplicate
'use strict';
const db = require('../config/dbconfig'),
  uuidv1 = require('uuid/v1'),
  utilCtrl = require('../controllers/utilityController'),
  config = require('../config/config'),
  async = require("async");

/**
 * User
 * Params:null
 */
exports.User = (req, res, next) => {
  async.waterfall([
    (callback) => {
      let sql = "SELECT * FROM `admin` WHERE  AND  `status`=1";
      db.sqlQuery(sql).then((result) => {
        if (result.length > 0) {
          callback(null, result);
        } else {
          callback("User not exist!", []);
        }
      }, (err) => {
        callback("User not exist!", []);
      });
    },
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        code: 200,
        api: "user",
        version: "v1",
        result: result,
        msg: "User data listed successfully!",
        err: err
      });
      next();
    } else {
      res.status(401).json({
        code: 401,
        api: "user",
        version: "v1",
        result: [],
        msg: "User not exist!",
        err: err
      });
      next();
    }
  });
}; //login

/**
 * Method: Login
 * Params: {
        email:"",
        password:""
   }
 */

exports.Login = (req, res, next) => {
  if (req.body.type != "app") {
    async.waterfall([
      (callback) => {
        if (req.body.email != "" || req.body.password != "")
          callback(null, req.body);
        else
          callback("Parameter Missing!", []);
      }, (body, callback) => {
        let sql =
          "SELECT * FROM `admin` WHERE `email`=" +db.mySqlPool.escape(body.email) +" AND `password`=" +db.mySqlPool.escape(body.password) +" AND  `status`=1";
        db.sqlQuery(sql).then((result) => {
          if (result.length > 0) {
            callback(null, result[0]);
          } else {
            callback("User not exist!", []);
          }
        }, (err) => {
          callback("User not exist!", []);
        });
      }, (user, callback) => {
        let sql = "INSERT INTO `session_log` (`id`, `user_id`, `type`, `user_name`, `login_datetime`, `logout_datetime`, `date`, `status`) VALUES (NULL, '" + user.id + "', '" + user.role + "', '" + user.name + "', CURRENT_TIMESTAMP, '', CURRENT_TIMESTAMP, '1')";
        db.sqlQuery(sql).then((result) => {
          callback(null, [user]);
        }, (err) => {
          callback(null, [user]);
        })
      },
      (result, callback) => {
        let uuid = (!result[0].authtoken || result[0].authtoken == "") ? uuidv1() : result[0].authtoken;
        let sql = "UPDATE `admin` SET `authtoken` = '" + uuid + "', `admin_last_login_date`=CURRENT_TIMESTAMP WHERE `admin`.`id` ='" + result[0].id + "' ";
        db.sqlQuery(sql).then((uprep) => {
          result[0].authtoken = uuid;
          callback(null, result);
        }, (err) => {
          console.log(err);
          callback(err + "User not exist!", []);
        })
      }
    ], function (err, result) {
      if (!err) {
        res.status(200).json({
          api: "login",
          code: 200,
          version: "v1",
          result: result,
          msg: "Login successfully!",
          err: err
        });
        next();
      } else {
        res.status(401).json({
          code: 401,
          api: "login",
          version: "v1",
          result: [],
          msg: "Invald user or password!",
          err: err
        });
        next();
      }
    });
  } else { //App Login
    async.waterfall([
      (callback) => {
        if (req.body.eng_mobile != "" && req.body.eng_mobile)
          callback(null, req.body);
        else
          callback("Parameter Missing!", []);
      }, (body, callback) => {
        let sql = "";
        db.sqlQuery(sql).then((result) => {
          if (result.length > 0) {
            callback(null, result[0]);
          } else {
            callback("User not found!", []);
          }
        }, (err) => {
          callback("User not found!", []);
        });
      }, (user, callback) => {
        let sql = "INSERT INTO `session_log` (`id`, `user_id`, `type`, `user_name`, `login_datetime`, `logout_datetime`, `date`, `status`) VALUES (NULL, '" + user.id + "', 'engineer', '" + user.eng_fname + "', CURRENT_TIMESTAMP, '', CURRENT_TIMESTAMP, '1')";
        db.sqlQuery(sql).then((result) => {
          callback(null, [user]);
        }, (err) => {
          callback(null, [user]);
        })
      },
    ], function (err, result) {
      if (!err) {
        res.status(200).json({
          api: "login",
          code: 200,
          version: "v1",
          result: result,
          msg: "Login successfully!",
          err: err
        });
        next();
      } else {
        res.status(401).json({
          code: 401,
          api: "login",
          version: "v1",
          result: [],
          msg: "Invald user or password!",
          err: err
        });
        next();
      }
    });

  }
}; //Login



exports.TrackClientInfo = (req, res, next) => {
  async.waterfall([
    (callback) => {
      var sql = "SELECT * FROM `session` WHERE `ipAddress`='" + req.body.ipAddress +
        "' ";
      db.sqlQuery(sql).then((result) => {
        if (result.length > 0) {
          callback(null, true, req.body);
        } else {
          callback(null, false, req.body);
        }
      }, (err) => {
        callback(null, false, req.body);
      });
    }, (isExist, body, callback) => {
      let userId = body.userId || 0;
      let sql =
        "INSERT INTO `session` (`userId`, `ipAddress`, `city`, `country`, `regionName`, `isp`, `zip`, `lat`, `lng`, `datetime`) VALUES (" +
        userId + ", '" + body.query + "', '" + body.city +
        "', '" + body.country + "', '" + body.regionName + "', '" + body.isp +
        "', '" + body.zip + "', '" + body.lat + "', '" + body.lon +
        "', CURRENT_TIMESTAMP);";
      if (isExist == true)
        sql = "UPDATE `session` SET `userId`=" + userId +
        ", `city` = '" + body.city + "',`country`='" + body.country +
        "',`isp`='" + body.isp + "',`zip`='" + body.zip + "' ,`lat`='" +
        body.lat + "',`lng`='" + body.lon +
        "',`datetime`=CURRENT_TIMESTAMP WHERE `session`.`ipAddress` = '" +
        body.query + "' ";

      console.log("sql", sql);
      db.sqlQuery(sql).then((result) => {
        callback(null, result);
      }, (err) => {
        callback(err, []);
      });
    }
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        msg: "successfully!",
      });
      next();
    } else {
      res.status(401).json({
        msg: err,
      });
      next();
    }
  });
}; //Registration

/**
 * Logout
 * Params:{
      "userId":"",
  }
 */
exports.Logout = (req, res, next) => {
  async.waterfall([
    (callback) => {
      if (req.body.userId != "")
        callback(null, req.body);
      else
        callback("Parameter Missing!", []);
    }, (result, callback) => {
      let sql =
        "UPDATE `admin_log` SET `authtoken` = '' WHERE `admin_log`.`id` ='" +
        req.body.userId + "' ";
      db.sqlQuery(sql).then((result) => {
        callback(null, result);
      }, (err) => {
        callback("User not exist!", []);
      });
    }
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        code: 200,
        api: "Logout",
        version: "v1",
        msg: "Logout successfully!",
        err: err
      });
      next();
    } else {
      res.status(401).json({
        code: 401,
        api: "Logout",
        version: "v1",
        msg: "Logout successfully!",
        err: err
      });
      next();
    }
  });

}; //Logout


/**
 * Get User
 */
exports.GetUser = (req, res, next) => {
  async.waterfall([
    (callback) => {
      let whereClouse = "";

      if (req.body.email && req.body.email != "")
        whereClouse += "`email`='" + req.body.email + "' ";

      if (req.body.id && req.body.id != "")
        whereClouse += "`id`='" + req.body.id + "' ";

      let sql = "SELECT * FROM `admin` WHERE  `status`='1' ORDER BY id DESC";
      if (whereClouse != "")
        sql = "SELECT * FROM `admin` WHERE  " + whereClouse + " AND `status`='1' ORDER BY id DESC";

      callback(null, sql);
    }, (sql, callback) => {
      db.sqlQuery(sql).then((result) => {
        if (result.length > 0) {
          callback(null, result);
        } else {
          callback("User not exist!", []);
        }
      }, (err) => {
        callback("User not exist!", []);
      });
    },
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        code: 200,
        api: "user",
        version: "v1",
        result: result,
        msg: "User data listed successfully!",
        err: err
      });
      next();
    } else {
      res.status(401).json({
        code: 401,
        api: "user",
        version: "v1",
        result: [],
        msg: "User not exist!",
        err: err
      });
      next();
    }
  });
}; //GetUser

/**
 * changePassword
 * 
 */
exports.changePassword = (req, res, next) => {
  async.waterfall([
    (callback) => {
      if (req.body.id != "" && req.body.oldPassword && req.body.oldPassword != "" && req.body.newPassword && req.body.newPassword != "")
        callback(null, req.body);
      else
        callback("Parameter Missing!", []);
    }, (body, callback) => {
      let sql = "UPDATE `admin` SET `password` = '" + body.newPassword + "' WHERE `admin`.`id` = " + body.id + " AND `password` = '" + body.oldPassword + "'  ";

      db.sqlQuery(sql).then((result) => {
        if (result.affectedRows > 0)
          callback(null, result);
        else
          callback("Invalid old password!", []);
      }, (err) => {
        callback("Invalid old password!", []);
      });
    },
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        code: 200,
        api: "user",
        version: "v1",
        result: result,
        msg: "Password updated successfully!",
        err: err
      });
      next();
    } else {
      res.status(401).json({
        code: 401,
        api: "user",
        version: "v1",
        result: [],
        msg: err,
        err: err
      });
      next();
    }
  });
}; //changePassword


exports.generateOtp = (req, res, next) => {
  async.waterfall([
    (callback) => {
      if (req.body.eng_mobile && req.body.eng_mobile != "" && req.body.id != "" && req.body.id)
        callback(null, req.body);
      else
        callback("Parameter Missing!", []);
    }, (body, callback) => {
      let otp = Math.floor(Math.random() * 8999 + 1000);
      let msg = config.engineerSmsText;
      msg = msg.replace("OTP_TEXT",otp);
      let  eng_name = req.body.eng_name || "";
      msg = msg.replace("Name_of_Site_Engineer",eng_name);
      
      utilCtrl.sendSms(req.body.eng_mobile, msg).then((data) => {
        callback(null, [{
          otp: otp
        }]);
      }, (err) => {
        callback("Unable to send sms at this time!", []);
      });
    },
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        code: 200,
        api: "user",
        version: "v1",
        result: result,
        msg: "Otp send successfully!",
        err: err
      });
      next();
    } else {
      res.status(401).json({
        code: 401,
        api: "user",
        version: "v1",
        result: [],
        msg: err,
        err: err
      });
      next();
    }
  });
}; //generateOtp


/**
 * registerUser
 * Params:{
      "admin_id":"",
      "admin_type":"Administrator/User",
      "role":"Administrator/User",
      "name":""
      "email":"",
      "mobile":"",
      "device_permission":"view/edit", 
      "school_permission":"view/edit",
      "engineer_permission":"view/edit"
  }
 */
exports.registerUser = (req, res, next) => {
  async.waterfall([
    (callback) => {
      if (req.body.admin_type != "" && req.body.admin_type == "Administrator" && req.body.admin_type && req.body.email != "" && req.body.name != "")
        callback(null, req.body);
      else
        callback("Unable to add user, please contact to admin!", []);
    },
    (body, callback) => {
      let sql = "SELECT * FROM `admin` WHERE `email`='" + body.email + "' ";
      db.sqlQuery(sql).then((result) => {
        if (result.length > 0)
          callback("Emial id already exist!", []);
        else
          callback(null, body);
      }, (err) => {
        callback("Emial id already exist!", []);
      });
    },
    (body, callback) => {
      let password = Math.random().toString(36).slice(-8); //Math.floor(Math.random()*8999+1000);    
      let sql = "INSERT INTO `admin` (`id`, `role`, `name`, `email`, `password`, `mobile`, `device_permission`, `school_permission`, `engineer_permission`, `authtoken`, `admin_last_login_date`, `datetime`, `status`) VALUES (NULL, '" + body.role + "', '" + body.name + "', '" + body.email + "', '" + password + "', '" + body.mobile + "', '" + body.device_permission + "', '" + body.school_permission + "', '" + body.engineer_permission + "', '' ,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '1')";
      db.sqlQuery(sql).then((result) => {
        callback(null, [result.insertId]);
      }, (err) => {
        callback("Emial id already exist!", []);
      });
    },
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        code: 200,
        api: "user",
        version: "v1",
        insertId: result,
        msg: "User data listed successfully!",
        err: err
      });
      next();
    } else {
      res.status(401).json({
        code: 401,
        api: "user",
        version: "v1",
        insertId: [],
        msg: "Emial id already exist!",
        err: err
      });
      next();
    }
  });
}; //registerUser


/**
 * sendPasswordEmail
 * Params:{
      "id":"",
      "email":"",
  }
 */
exports.sendPasswordEmail = (req, res, next) => {
  async.waterfall([
    (callback) => {
      if (req.body.email && req.body.email != "" && req.body.id != "" && req.body.id)
        callback(null, req.body);
      else
        callback("Parameter Missing!", []);
    }, (body, callback) => {
      let sql = "SELECT name, password FROM `admin` WHERE `email`='" + body.email + "'  ";
      db.sqlQuery(sql).then((result) => {
        if (result.length > 0)
          callback(null, result);
        else
          callback("User not exist!", body);
      }, (err) => {
        callback("User not exist!", []);
      });
    },
    (user, callback) => {
      let html = "<h5>Your dms password is <br> Password: " + user[0].password + "  <br> User:  " + user[0].name + "</h5>";
      utilCtrl.sendEmail(req.body.email, "Your Password", "", html).then((data) => {
        callback(null, data);
      }, (err) => {
        callback(err, []);
        //callback("Unable to send email at this time!", []);
      });
    },
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        code: 200,
        api: "user",
        version: "v1",
        result: result,
        msg: "Email send successfully!",
        err: err
      });
      next();
    } else {
      res.status(401).json({
        code: 401,
        api: "user",
        version: "v1",
        result: [],
        msg: err,
        err: err
      });
      next();
    }
  });
}; //sendPasswordEmail

/**
 * deleteUser
 * Params:{
      "id":"",
  }
 */
exports.removeUser = (req, res, next) => {
  async.waterfall([
    (callback) => {
      if (req.body.id != "" && req.body.id)
        callback(null, req.body);
      else
        callback("Parameter Missing!", []);
    }, (body, callback) => {
      let sql = "UPDATE `admin` SET `status` = '0' WHERE `admin`.`id` = " + body.id + " ";
      db.sqlQuery(sql).then((result) => {
        callback(null, result);
      }, (err) => {
        callback("User not exist!", []);
      });
    },
  ], function (err, result) {
    if (!err) {
      res.status(200).json({
        code: 200,
        api: "user",
        version: "v1",
        result: result,
        msg: "User Removed successfully.",
        err: err
      });
      next();
    } else {
      res.status(401).json({
        code: 401,
        api: "user",
        version: "v1",
        result: [],
        msg: err,
        err: err
      });
      next();
    }
  });
}; //removeUser


