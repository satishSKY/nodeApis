'use strict';

module.exports = function (app, db) {
  let utilCtrl = require('../controllers/utilityController'),
    authCtrl = require('../controllers/authController');


const rootPath = "/api/v1/";//Production


  app.route(rootPath+'api_status').post(function (req, res, next) {
    res.status(200).json({
      code: 200,
      version:1,
      status: "working fine",
      msg: "api running"
    });
    next();
  });


  /**Auth Controller */
  app.route(rootPath+'login').post(authCtrl.Login);
  //app.route(rootPath+'registration').post(authCtrl.Registration);
  app.route(rootPath+'track_client_info').post(authCtrl.TrackClientInfo);
  app.route(rootPath+'generate_otp').post(authCtrl.generateOtp);
  

  /*AUTH */
  app.route(rootPath+'auth/user').post(authCtrl.User);
  app.route(rootPath+'auth/get_user').post(authCtrl.GetUser);
  app.route(rootPath+'auth/change_password').post(authCtrl.changePassword);
  app.route(rootPath+'auth/register_user').post(authCtrl.registerUser);
  app.route(rootPath+'auth/user_verification').post(authCtrl.sendPasswordEmail);
  app.route(rootPath+'auth/remove_user').delete(authCtrl.removeUser);
  app.route(rootPath+'auth/update_user').post(authCtrl.updateUser);
  
  
  app.route(rootPath+'auth/logout').post(authCtrl.Logout);

  /**
   * utilCtrl
   */
  app.route(rootPath+'preference').get(utilCtrl.Preference);
  app.route(rootPath+'download_file/:dir/:file').get(utilCtrl.downloadFile);


  
  
  





};

// app.route(rootPath+'rto_list/:rtId')
//   .get(llCtrl.rtoDetails)
//   .put(llCtrl.rtoDetails)
//   .delete(llCtrl.rtoDetails);