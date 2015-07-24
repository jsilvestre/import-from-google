// Generated by CoffeeScript 1.9.3
var async, googleToken, importCalendar, importContacts, importPhotos, log, realtimer, syncGmail;

googleToken = require('../utils/google_access_token');

importContacts = require('../utils/import_contacts');

importPhotos = require('../utils/import_photos');

importCalendar = require('../utils/import_calendar');

realtimer = require('../utils/realtimer');

syncGmail = require('../utils/sync_gmail');

async = require('async');

log = require('printit')('leaveGcontroller');

module.exports.index = function(req, res) {
  var url;
  url = googleToken.getAuthUrl();
  return res.render('index', {
    imports: "window.oauthUrl = \"" + url + "\";"
  });
};

module.exports.lg = function(req, res, next) {
  var auth_code, ref, scope;
  res.send(200);
  ref = req.body, auth_code = ref.auth_code, scope = ref.scope;
  return googleToken.generateRequestToken(auth_code, function(err, tokens) {
    if (err) {
      log.error(err);
    }
    if (!(tokens != null ? tokens.access_token : void 0)) {
      console.log("No access token");
      realtimer.sendEnd("invalid token");
      return;
    }
    return async.series([
      function(callback) {
        return syncGmail(tokens.access_token, tokens.refresh_token, scope.sync_gmail === 'true', function(err) {
          if (scope.sync_gmail === 'true') {
            realtimer.sendEnd("syncGmail.end");
          }
          return callback(null);
        });
      }, function(callback) {
        if (scope.photos !== 'true') {
          return callback(null);
        }
        return importPhotos(tokens.access_token, function(err) {
          if (err) {
            realtimer.sendPhotosErr(err);
          }
          realtimer.sendEnd("photos.end");
          return callback(null);
        });
      }, function(callback) {
        if (scope.calendars !== 'true') {
          return callback(null);
        }
        return importCalendar(tokens.access_token, function(err) {
          if (err) {
            realtimer.sendCalendarErr(err);
          }
          realtimer.sendEnd("events.end");
          return callback(null);
        });
      }, function(callback) {
        if (scope.contacts !== 'true') {
          return callback(null);
        }
        return importContacts(tokens.access_token, function(err) {
          if (err) {
            realtimer.sendContactsErr(err);
          }
          realtimer.sendEnd("contacts.end");
          return callback(null);
        });
      }
    ], function(err) {
      log.debug("import from google complete");
      realtimer.sendEnd("ok");
      if (err) {
        return console.log(err);
      }
    });
  });
};
