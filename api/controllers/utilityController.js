	'use strict';
	const util = require("util"),
		formidable = require('formidable'),
		request = require('request'),
		pdf = require('html-pdf'),
		config = require('../config/config'),
		fs = require('fs'),
		async = require('async'),
		path = require('path'), //  add path module to get path	
		xlsxj = require("xlsx-to-json-lc"),
		//Jimp = require("jimp"),
		nodemailer = require('nodemailer');



	/**
	 * Preference
	 * params:null
	 */
	exports.Preference = (req, res, next) => {
		res.status(200).json({
			api: "preference",
			version: "v1",
			code: 200,
			status: true,
			msg: "Data listed successfully.",
			result: {
				apiKey: config.apiKey,
				ipInfoUrl: config.ipInfoUrl,
				imageUrl: config.imageUrl
			}
		});
		next();
	} //Preference		


	exports.convertNumberToWords = (amount) => {
		var words = new Array();
		words[0] = '';
		words[1] = 'One';
		words[2] = 'Two';
		words[3] = 'Three';
		words[4] = 'Four';
		words[5] = 'Five';
		words[6] = 'Six';
		words[7] = 'Seven';
		words[8] = 'Eight';
		words[9] = 'Nine';
		words[10] = 'Ten';
		words[11] = 'Eleven';
		words[12] = 'Twelve';
		words[13] = 'Thirteen';
		words[14] = 'Fourteen';
		words[15] = 'Fifteen';
		words[16] = 'Sixteen';
		words[17] = 'Seventeen';
		words[18] = 'Eighteen';
		words[19] = 'Nineteen';
		words[20] = 'Twenty';
		words[30] = 'Thirty';
		words[40] = 'Forty';
		words[50] = 'Fifty';
		words[60] = 'Sixty';
		words[70] = 'Seventy';
		words[80] = 'Eighty';
		words[90] = 'Ninety';
		amount = amount.toString();
		var atemp = amount.split(".");
		var number = atemp[0].split(",").join("");
		var n_length = number.length;
		var words_string = "";
		if (n_length <= 9) {
			var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
			var received_n_array = new Array();
			for (var i = 0; i < n_length; i++) {
				received_n_array[i] = number.substr(i, 1);
			}
			for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
				n_array[i] = received_n_array[j];
			}
			for (var i = 0, j = 1; i < 9; i++, j++) {
				if (i == 0 || i == 2 || i == 4 || i == 7) {
					if (n_array[i] == 1) {
						n_array[j] = 10 + parseInt(n_array[j]);
						n_array[i] = 0;
					}
				}
			}
			var value = "";
			for (var i = 0; i < 9; i++) {
				if (i == 0 || i == 2 || i == 4 || i == 7) {
					value = n_array[i] * 10;
				} else {
					value = n_array[i];
				}
				if (value != 0) {
					words_string += words[value] + " ";
				}
				if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
					words_string += "Crores ";
				}
				if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
					words_string += "Lakhs ";
				}
				if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
					words_string += "Thousand ";
				}
				if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
					words_string += "Hundred and ";
				} else if (i == 6 && value != 0) {
					words_string += "Hundred ";
				}
			}
			words_string = words_string.split("  ").join(" ");
		}
		return words_string;
	} //convertNumberToWords

	exports.downloadFile = (req, res, next) => {
		const file = req.params.file,
			dir = req.params.dir;
		//var fileUri = path.resolve(".") + '/assets/PDF/' + file; //__dirname + '/upload/';	     
		var fileUri = path.resolve(".") + '/assets/' + dir + '/' + file; //__dirname + '/upload/';	     
		//console.log("fileUri: ", fileUri);
		fs.access(fileUri, fs.constants.F_OK, (err) => {
			if (!err) {
				res.download(fileUri); // Set disposition and send it.
			} else {
				res.status(404).send({
					'success': 0,
					"msg": "File not found",
					"status": false,
					"fileName": file
				});
			}
			//console.log(err ? 'no access!' : 'can read/write');
		});
	} //downloadFile

	exports.uploadImage = (req, res, isExcel) => {
		return new Promise((resolve, reject) => {
			if (req.params.type != "") {
				var form = new formidable.IncomingForm();
				let uploadDir = "";
				let str = req.headers.filetype;
				if (isExcel)
					uploadDir = path.resolve(".") + '/assets/excel/';
				else
					uploadDir = path.resolve(".") + '/assets/images/';

				form.uploadDir = uploadDir;
				form.keepExtensions = true;
				form.multiples = true;
				form.on('aborted', function () {
					reject(false);
				});
				let myfiles;
				form.parse(req, function (err, fields, files) {
					myfiles = files;
					//let filename = files.upload.path;					
				});
				form.on('end', function () {
					if (req.originalUrl.search("school/upload_image/") > -1) {
						let name = "";
						for (var i = 0; i < Object.keys(myfiles).length; i++) {
							console.log("myfiles i: ", myfiles['file[' + i + ']'].path);
							//name += myfiles['file[' + i + ']'].path.substr(myfiles['file[' + i + ']'].path.lastIndexOf('/') + 1);
							name += myfiles['file[' + i + ']'].path.substr(myfiles['file[' + i + ']'].path.lastIndexOf('images') + 7);
							name += (i == (Object.keys(myfiles).length - 1)) ? '' : ',';
						}
						resolve(name);
					} else {
						//myfiles.file["path"].substr(myfiles.file["path"].lastIndexOf('/')+1);		
						try {							
							//resolve(myfiles.file["path"].substr(myfiles.file["path"].lastIndexOf('/') + 1));
							let nm = "";
							if (isExcel)
								nm = myfiles.file["path"].substr(myfiles.file["path"].lastIndexOf('excel') + 6);							
							else
								nm = myfiles.file["path"].substr(myfiles.file["path"].lastIndexOf('images') + 7);							

							resolve(nm);
						} catch (error) {
							reject(false);
						}

					}
				});
				return false;
			} else {
				reject(false);
			}
		});
	}; //uploadImage

	exports.sendEmail = (to, subject, text, html, attachment) => {
		return new Promise((resolve, reject) => {
			let transporter = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 587,
				secure: false, // secure:true for port 465, secure:false for port 587
				auth: {
					user: '',
					pass: ''
				}
			});
			let mailOptions = {
				from: ' ', // sender address
				to: to, // list of receivers
				subject: subject, // Subject line
				text: text, // plain text body
				html: html // html body
				// attachments: [{ // utf-8 string as an attachment
				// 		filename:"MP091735903067.pdf",
				// 		path: path.resolve(".") + '/assets/DL_Duplicate_Cash_Receipt/MP091735903067.pdf',				
				// 	},
				// 	{ // binary buffer as an attachment
				// 		filename:"MP091735903067.pdf",
				// 		path: path.resolve(".") + '/assets/DL_Duplicate_Cash_Receipt/MP091735903067.pdf',			
				// 	},
				// ]

			};
			if (attachment != null)
				mailOptions.attachments = attachment;

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error)
					reject(error);
				else
					resolve(info);
				//console.log('Message %s sent: %s', info.messageId, info.response);
			});
		});
	} //sendEmail


	/**
	 * Method: sendSms
	 * @Param {
				"user": "pmtsm",
				"pwd": "pmtsm",
				"from": "ODTRPT",
				"to": to,
				"msg": msg
			};	
	 */
	exports.sendSms = (to, msg) => {
		return new Promise((resolve, reject) => {
			let url = config.smsApi + "+91" + to;
			url = url.replace("MSG", msg);
			request({
				method: 'GET',
				uri: url,
				headers: {
					'Content-Type': 'application/json'
				}
				//body: JSON.stringify(data),				
			}, function (err, res, body) {
				if (!err) {
					console.log("SMS: ", body)
					//resolve(JSON.parse(body));
					resolve(body);
				} else {
					console.log("SMS err: ", err)
					reject(err);
				}
			});
		});
	} //sendSms

	/**
	 * Method: sendSms
	 * @Param: url
	 */
	exports.createBitLink = (url) => {
		return new Promise((resolve, reject) => {
			async.waterfall([
				(callback) => {
					if (url != "")
						callback(null, url);
					else
						callback("Parameter Missing!", url);
				},
				(burl, callback) => {
					let url = "" + burl;
					console.log(url);
					request.get({
						url: url,
						json: true
					}, (e, r, result) => {
						if (result)
							callback(null, result.data);
						else
							callback("Record Not Found!", result);
					});
				}
			], function (err, result) {
				if (!err) {
					resolve(result);
				} else {
					reject(err)
				}
			});
		});
	} //getBitLink


	/**
	 * Create PDF
	 * 
	 */
	/** Create image with Background image for Cash_Receipt_Duplicate
	 * params:text,htmlFile,fileName(new file name)
	 */
	exports.createPDFBg = (text, htmlFile, fileName) => {
		// return new Promise((resolve, reject) => {
		// 	Jimp.loadFont(path.resolve(".") + '/assets/font/font.fnt').then(function (font) { // load font from .fnt file    
		// 		var str = text;
		// 		//console.log("str.length", str.length);
		// 		Jimp.read(path.resolve(".") + '/assets/images/text.png').then(function (lenna) {
		// 			lenna.resize(str.length * 7, 25) // resize
		// 				.quality(100) // set JPEG quality
		// 				//.setPixelColor('#262626')
		// 				//.background("#AARRGG")
		// 				//.greyscale() // set greyscale
		// 				.print(font, 10, 10, str, str.length * 7)
		// 				.write(path.resolve(".") + '/assets/images/bg.png'); // save

		// 			lenna.getBase64("image/png", function (errr, data) {
		// 				var html = fs.readFileSync(path.resolve(".") + '/assets/html/' + htmlFile, 'utf8');
		// 				var t = html.replace("background-image:''", "background-image:url('" + data + "') !important;");
		// 				//console.log("<<><>>",html.search("background-image:''"));
		// 				fs.writeFile(path.resolve(".") + '/assets/html-pdf/form.html', t, (er) => {
		// 					if (er)
		// 						reject(err);
		// 					else {
		// 						console.log('The file has been saved!');
		// 						var htmlPdf = fs.readFileSync(path.resolve(".") + '/assets/html-pdf/form.html', 'utf8');
		// 						pdf.create(htmlPdf, {
		// 							format: 'Letter'
		// 						}).toFile(path.resolve(".") + '/assets/PDF/' + fileName, function (err, resp) {
		// 							if (err)
		// 								reject(err);
		// 							else
		// 								resolve("success");
		// 						});
		// 					}
		// 				});
		// 			});
		// 		}).catch(function (err) {
		// 			reject(err);
		// 			console.error(err);
		// 		});
		// 	})
		// })
	} //createPDFBg

	/**
	 * Create normal pdf
	 * text, htmlFile, fileName=path.resolve(".") + '/assets/PDF/lafd.pdf'
	 */
	//exports.createPDF = (req, res, next) => {
	exports.createPDFNormal = (htmlFile, filePath) => {
		console.log("path", path);
		filePath = path.resolve(".") + '/assets/marksheets/marksheet.pdf';
		return new Promise((resolve, reject) => {
			var htmlFile = fs.readFileSync(path.resolve(".") + '/assets/html/marksheet.html', 'utf8');
			pdf.create(htmlFile, {
				format: 'Letter'
			}).toFile(filePath, function (err, resp) { //path.resolve(".") + '/assets/PDF/lafd.pdf'
				console.log(resp, "err", err);
				if (err)
					reject(err); //res.send(err);//reject(err);
				else
					resolve(resp); //res.send(resp);//resolve(resp);				
			});
		})
	}; //createPDFNormal


	/**
	 * parseExcel
	 * 
	 */

	exports.parseExcel = (fname) => {
		return new Promise((resolve, reject) => {
			xlsxj({
				input: path.resolve(".") + '/assets/excel/' + fname,
				output: path.resolve(".") + '/assets/excel/output.json',
				lowerCaseHeaders: true //converts excel header rows into lowercase as json keys
			}, function (err, result) {
				if (err) {
					reject(err);
					console.error(err);
				} else {
					//console.log(result);
					resolve(result);
				}
			});
		})
	}; //parseExcel