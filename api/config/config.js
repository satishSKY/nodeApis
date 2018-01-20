/*ps | grep node
kill <processId>
      OR
ps -ax | grep node
kill -9 60778*/

/*Windows
netstat -ano | find "LISTENING" | find "8080"
Taskkill /PID 26356 /F
*/

var Config = function () {
  this.DevEnvironment = "dev"; //prod, dev
  this.port = '3000';
  this.apiKey = "v1$jd343s#fdn&$y";
  if (this.DevEnvironment == "dev") { /**LOCAL **/
    this.host = 'localhost';
    this.user = 'root';
    this.password = '';
    this.dataBaseName = "";
    this.hostUrl = 'http://localhost:' + this.port;
  } else { /**Server**/
    this.host = 'localhost';
    this.user = 'root';
    this.password = 'JK@NY7%$UYLR#';
    this.dataBaseName = "";
    this.hostUrl = 'http://:' + this.port;
  }
  this.defaultDistrictPassword = "dms@123"
  this.fileAccessUrl = 'api/v1/download_file/';
  this.ipInfoUrl = "http://ip-api.com/json";
  this.imageUrl = this.hostUrl + "/api/v1/download_file/images/";    
  return this;
}


module.exports = new Config();