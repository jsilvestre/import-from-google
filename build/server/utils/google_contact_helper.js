// Generated by CoffeeScript 1.8.0
var CompareContacts, ContactHelper, GCH, PICTUREREL, https, im, log, request, url;

https = require('https');

im = require('imagemagick-stream');

url = require('url');

request = require('request-json');

ContactHelper = require('./contact_helper');

CompareContacts = require('./compare_contacts');

module.exports = GCH = {};

log = require('printit')({
  date: true
});

GCH.ACCOUNT_TYPE = 'com.google';

GCH.extractGoogleId = function(gEntry) {
  var parts, uri, _ref;
  uri = (_ref = gEntry.id) != null ? _ref.$t : void 0;
  if (uri != null) {
    parts = uri.split('/');
    return parts[parts.length - 1];
  }
};

GCH.fromGoogleContact = function(gContact, accountName) {
  var adr, contact, email, ev, getTypeFragment, getTypePlain, iM, nameComponent, phone, rel, web, websites, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
  if (gContact == null) {
    return;
  }
  contact = {
    docType: 'contact',
    fn: (_ref = gContact.gd$name) != null ? (_ref1 = _ref.gd$fullName) != null ? _ref1.$t : void 0 : void 0,
    org: gContact != null ? (_ref2 = gContact.gd$organization) != null ? (_ref3 = _ref2[0]) != null ? (_ref4 = _ref3.gd$orgName) != null ? _ref4.$t : void 0 : void 0 : void 0 : void 0,
    title: gContact != null ? (_ref5 = gContact.gd$organization) != null ? (_ref6 = _ref5[0]) != null ? (_ref7 = _ref6.gd$orgTitle) != null ? _ref7.$t : void 0 : void 0 : void 0 : void 0,
    bday: (_ref8 = gContact.gContact$birthday) != null ? _ref8.when : void 0,
    nickname: (_ref9 = gContact.gContact$nickname) != null ? _ref9.$t : void 0,
    note: (_ref10 = gContact.content) != null ? _ref10.$t : void 0,
    accounts: [
      {
        type: 'com.google',
        name: accountName,
        id: GCH.extractGoogleId(gContact),
        lastUpdate: (_ref11 = gContact.updated) != null ? _ref11.$t : void 0
      }
    ]
  };
  nameComponent = function(field) {
    var part, _ref12, _ref13;
    part = ((_ref12 = gContact.gd$name) != null ? (_ref13 = _ref12[field]) != null ? _ref13.$t : void 0 : void 0) || '';
    return part.replace(/;/g, ' ');
  };
  contact.n = "" + (nameComponent('gd$familyName')) + ";" + (nameComponent('gd$givenName')) + ";" + (nameComponent('gd$additionalName')) + ";" + (nameComponent('gd$namePrefix')) + ";" + (nameComponent('gd$nameSuffix'));
  getTypeFragment = function(component) {
    var _ref12;
    return ((_ref12 = component.rel) != null ? _ref12.split('#')[1] : void 0) || component.label || 'other';
  };
  getTypePlain = function(component) {
    return component.rel || component.label || 'other';
  };
  contact.datapoints = [];
  _ref12 = gContact.gd$email || [];
  for (_i = 0, _len = _ref12.length; _i < _len; _i++) {
    email = _ref12[_i];
    contact.datapoints.push({
      name: "email",
      pref: email.primary || false,
      value: email.address,
      type: getTypeFragment(email)
    });
  }
  _ref13 = gContact.gd$phoneNumber || [];
  for (_j = 0, _len1 = _ref13.length; _j < _len1; _j++) {
    phone = _ref13[_j];
    contact.datapoints.push({
      name: "tel",
      pref: phone.primary || false,
      value: phone.$t,
      type: getTypeFragment(phone)
    });
  }
  _ref14 = gContact.gd$im || [];
  for (_k = 0, _len2 = _ref14.length; _k < _len2; _k++) {
    iM = _ref14[_k];
    contact.datapoints.push({
      name: "chat",
      value: iM.address,
      type: ((_ref15 = iM.protocol) != null ? _ref15.split('#')[1] : void 0) || 'other'
    });
  }
  _ref16 = gContact.gd$structuredPostalAddress || [];
  for (_l = 0, _len3 = _ref16.length; _l < _len3; _l++) {
    adr = _ref16[_l];
    contact.datapoints.push({
      name: "adr",
      value: ["", "", ((_ref17 = adr.gd$street) != null ? _ref17.$t : void 0) || "", ((_ref18 = adr.gd$city) != null ? _ref18.$t : void 0) || "", ((_ref19 = adr.gd$region) != null ? _ref19.$t : void 0) || "", ((_ref20 = adr.gd$postcode) != null ? _ref20.$t : void 0) || "", ((_ref21 = adr.gd$country) != null ? _ref21.$t : void 0) || ""],
      type: getTypeFragment(adr)
    });
  }
  websites = gContact.gContact$website || [];
  for (_m = 0, _len4 = websites.length; _m < _len4; _m++) {
    web = websites[_m];
    contact.datapoints.push({
      name: "url",
      value: web.href,
      type: getTypePlain(web)
    });
  }
  _ref22 = gContact.gContact$relation || [];
  for (_n = 0, _len5 = _ref22.length; _n < _len5; _n++) {
    rel = _ref22[_n];
    contact.datapoints.push({
      name: "relation",
      value: rel.$t,
      type: getTypePlain(rel)
    });
  }
  _ref23 = gContact.gContact$event || [];
  for (_o = 0, _len6 = _ref23.length; _o < _len6; _o++) {
    ev = _ref23[_o];
    contact.datapoints.push({
      name: "about",
      value: (_ref24 = ev.gd$when) != null ? _ref24.startTime : void 0,
      type: getTypePlain(ev)
    });
  }
  contact.tags = ['google'];
  return contact;
};

GCH.toGoogleContact = function(contact, gEntry) {
  var addField, dp, field, firstName, gContact, lastName, middleName, name, org, prefix, setTypeFragment, street, suffix, _extend, _i, _len, _ref, _ref1, _ref2, _ref3;
  _extend = function(a, b) {
    var k, v;
    for (k in b) {
      v = b[k];
      if (v != null) {
        a[k] = v;
      }
    }
    return a;
  };
  gContact = {
    updated: {
      $t: contact.revision
    }
  };
  _ref = contact.n.split(';'), lastName = _ref[0], firstName = _ref[1], middleName = _ref[2], prefix = _ref[3], suffix = _ref[4];
  name = {};
  name.gd$fullName = {
    $t: contact.fn
  };
  if ((lastName != null) && lastName !== '') {
    name.gd$familyName = {
      $t: lastName
    };
  }
  if ((firstName != null) && firstName !== '') {
    name.gd$givenName = {
      $t: firstName
    };
  }
  if ((middleName != null) && middleName !== '') {
    name.gd$additionalName = {
      $t: middleName
    };
  }
  if ((prefix != null) && prefix !== '') {
    name.gd$namePrefix = {
      $t: prefix
    };
  }
  if ((suffix != null) && suffix !== '') {
    name.gd$nameSuffix = {
      $t: suffix
    };
  }
  gContact.gd$name = name;
  if (contact.bday != null) {
    gContact.gContact$birthday = {
      when: contact.bday
    };
  }
  if (contact.nickname != null) {
    gContact.gContact$nickname = {
      $t: contact.nickname
    };
  }
  gContact.content = {
    $t: contact.note || ''
  };
  if ((contact.org != null) || (contact.title != null)) {
    org = {
      rel: "http://schemas.google.com/g/2005#other"
    };
    if (contact.org != null) {
      org.gd$orgName = {
        $t: contact.org
      };
    }
    if (contact.title != null) {
      org.gd$orgTitle = {
        $t: contact.title
      };
    }
    gContact.gd$organization = [org];
  }
  setTypeFragment = function(dp, field) {
    var _ref1;
    if ((_ref1 = dp.type) === 'fax' || _ref1 === 'home' || _ref1 === 'home_fax' || _ref1 === 'mobile' || _ref1 === 'other' || _ref1 === 'pager' || _ref1 === 'work' || _ref1 === 'work_fax') {
      field.rel = "http://schemas.google.com/g/2005#" + dp.type;
    } else {
      field.label = dp.type;
    }
    return field;
  };
  addField = function(gField, field) {
    if (!gContact[gField]) {
      gContact[gField] = [];
    }
    return gContact[gField].push(field);
  };
  if (contact.url && !contact.datapoints.some(function(dp) {
    return dp.type === "url" && dp.value === contact.url;
  })) {
    addField('gContact$website', {
      href: contact.url,
      rel: 'other'
    });
  }
  _ref1 = contact.datapoints;
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    dp = _ref1[_i];
    if (!((dp.value != null) && dp.value !== '')) {
      continue;
    }
    name = dp.name.toUpperCase();
    switch (name) {
      case 'TEL':
        if ((dp.value != null) && dp.value !== '') {
          addField('gd$phoneNumber', setTypeFragment(dp, {
            $t: dp.value
          }));
        }
        break;
      case 'EMAIL':
        field = setTypeFragment(dp, {
          address: dp.value
        });
        if (field.pref) {
          field.primary = "true";
        }
        addField('gd$email', field);
        break;
      case 'ADR':
        if (dp.value instanceof Array) {
          field = setTypeFragment(dp, {});
          field.gd$formattedAddress = ContactHelper.adrArrayToString(dp.value);
          street = ContactHelper.adrCompleteStreet(dp.value);
          if (street !== '') {
            field.gd$street = {
              $t: street
            };
          }
          if (dp.value[3]) {
            field.gd$city = {
              $t: dp.value[3]
            };
          }
          if (dp.value[4]) {
            field.gd$region = {
              $t: dp.value[4]
            };
          }
          if (dp.value[5]) {
            field.gd$postcode = {
              $t: dp.value[5]
            };
          }
          if (dp.value[6]) {
            field.gd$country = {
              $t: dp.value[6]
            };
          }
          addField("gd$structuredPostalAddress", field);
        }
        break;
      case 'CHAT':
        addField('gd$im', {
          protocol: "http://schemas.google.com/g/2005#" + dp.type,
          address: dp.value,
          rel: "http://schemas.google.com/g/2005#other"
        });
        break;
      case 'SOCIAL':
      case 'URL':
        field = {
          href: dp.value
        };
        if ((_ref2 = dp.type) === 'home-page' || _ref2 === 'blog' || _ref2 === 'profile' || _ref2 === 'home' || _ref2 === 'work' || _ref2 === 'other' || _ref2 === 'ftp') {
          field.rel = dp.type;
        } else {
          field.label = dp.type;
        }
        addField('gContact$website', field);
        break;
      case 'ABOUT':
        field = {
          gd$when: {
            startTime: dp.value
          }
        };
        if (dp.type === 'anniversary') {
          field.rel = dp.type;
        } else {
          field.label = dp.type;
        }
        addField('gContact$event', field);
        break;
      case 'RELATION':
        field = {
          $t: dp.value
        };
        if ((_ref3 = dp.type) === 'assistant' || _ref3 === 'brother' || _ref3 === 'child' || _ref3 === 'domestic-partner' || _ref3 === 'father' || _ref3 === 'friend' || _ref3 === 'manager' || _ref3 === 'mother' || _ref3 === 'parent' || _ref3 === 'partner' || _ref3 === 'referred-by' || _ref3 === 'relative' || _ref3 === 'sister' || _ref3 === 'spouse') {
          field.rel = dp.type;
        } else {
          field.label = dp.type;
        }
        addField('gContact$relation', field);
    }
  }
  if (gEntry != null) {
    return _extend(gEntry, gContact);
  } else {
    return gContact;
  }
};

PICTUREREL = "http://schemas.google.com/contacts/2008/rel#photo";

GCH.addContactPictureInCozy = function(accessToken, cozyContact, gContact, done) {
  var hasPicture, opts, pictureLink, pictureUrl, _ref, _ref1;
  log.debug("addContactPictureInCozy " + (GCH.extractGoogleId(gContact)));
  pictureLink = gContact.link.filter(function(link) {
    return link.rel === PICTUREREL;
  });
  pictureUrl = (_ref = pictureLink[0]) != null ? _ref.href : void 0;
  hasPicture = ((_ref1 = pictureLink[0]) != null ? _ref1['gd$etag'] : void 0) != null;
  if (!(pictureUrl && hasPicture)) {
    return done(null);
  }
  opts = url.parse(pictureUrl);
  opts.headers = {
    'Authorization': 'Bearer ' + accessToken,
    'GData-Version': '3.0'
  };
  log.debug("fetch " + (GCH.extractGoogleId(gContact)) + " contact's picture");
  return request = https.get(opts, function(stream) {
    var thumbStream, type;
    log.debug("response for " + (GCH.extractGoogleId(gContact)) + " picture");
    stream.on('error', done);
    if (stream.statusCode !== 200) {
      return done(new Error("error fetching " + pictureUrl + ": " + stream.statusCode));
    }
    thumbStream = stream.pipe(im().resize('300x300^').crop('300x300'));
    thumbStream.on('error', done);
    thumbStream.path = 'useless';
    type = stream.headers['content-type'];
    opts = {
      name: 'picture',
      type: type
    };
    return cozyContact.attachFile(thumbStream, opts, function(err) {
      if (err) {
        log.error("picture " + err);
      } else {
        log.debug("picture ok");
      }
      return done(err);
    });
  });
};

GCH.putPicture2Google = function(accessToken, account, contact, callback) {
  var options, req, stream, _ref;
  if (((_ref = contact._attachments) != null ? _ref.picture : void 0) == null) {
    return callback();
  }
  stream = contact.getFile('picture', function(err) {
    if (err) {
      return callback(err);
    }
  });
  options = {
    method: 'PUT',
    host: 'www.google.com',
    port: 443,
    path: "/m8/feeds/photos/media/" + account.name + "/" + account.id,
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'GData-Version': '3.0',
      'Content-Type': 'image/*',
      'If-Match': '*'
    }
  };
  req = https.request(options, function(res) {
    res.on('error', callback);
    return res.on('data', function(chunk) {
      if (res.statusCode !== 200) {
        log.info("" + res.statusCode + " while uploading picture: " + (chunk.toString()));
      }
      return callback();
    });
  });
  return stream.pipe(req);
};

GCH.filterContactsOfAccountByIds = function(cozyContacts, accountName) {
  var account, contact, ofAccountByIds, _i, _len;
  ofAccountByIds = {};
  for (_i = 0, _len = cozyContacts.length; _i < _len; _i++) {
    contact = cozyContacts[_i];
    account = contact.getAccount(GCH.ACCOUNT_TYPE, accountName);
    if (account != null) {
      ofAccountByIds[account.id] = contact;
    }
  }
  return ofAccountByIds;
};

GCH.fetchAccountName = function(accessToken, callback) {
  var client;
  client = request.createClient('https://www.googleapis.com');
  client.headers = {
    'Authorization': 'Bearer ' + accessToken,
    'GData-Version': '3.0'
  };
  return client.get('/oauth2/v2/userinfo', function(err, res, body) {
    if (err) {
      return callback(err);
    }
    if (body.error) {
      log.info("Error while fetching account name : ");
      log.info(body);
      return callback(body);
    }
    return callback(null, body.email);
  });
};

GCH.updateCozyContact = function(gEntry, contacts, accountName, token, callback) {
  var Contact, accountC, accountG, cozyContact, cozyContacts, endSavePicture, fromCozy, fromGoogle, gId, ofAccountByIds, updateContact, _i, _len;
  Contact = require('../models/contact');
  ofAccountByIds = contacts.ofAccountByIds;
  cozyContacts = contacts.cozyContacts;
  fromGoogle = new Contact(GCH.fromGoogleContact(gEntry, accountName));
  gId = GCH.extractGoogleId(gEntry);
  endSavePicture = function(err, updatedContact) {
    if (err != null) {
      log.error("An error occured while creating or updating the " + "contact.");
      log.raw(err);
      return callback(err);
    }
    log.debug("updated " + (fromGoogle != null ? fromGoogle.fn : void 0));
    return GCH.addContactPictureInCozy(token, updatedContact, gEntry, callback);
  };
  updateContact = function(fromCozy, fromGoogle) {
    CompareContacts.mergeContacts(fromCozy, fromGoogle);
    return fromCozy.save(endSavePicture);
  };
  accountG = fromGoogle.accounts[0];
  if (accountG.id in ofAccountByIds) {
    fromCozy = ofAccountByIds[accountG.id];
    accountC = fromCozy.getAccount(GCH.ACCOUNT_TYPE, accountName);
    if (accountC.lastUpdate < accountG.lastUpdate && ContactHelper.intrinsicRev(fromGoogle) !== ContactHelper.intrinsicRev(fromCozy)) {
      log.info("Update " + gId + " from google");
      log.debug("Update " + (fromCozy != null ? fromCozy.fn : void 0) + " from google");
      return updateContact(fromCozy, fromGoogle);
    } else {
      log.info("Google contact " + gId + " already synced and uptodate");
      log.debug("GContact " + (fromCozy != null ? fromCozy.fn : void 0) + " already synced and uptodate");
      return callback();
    }
  } else {
    fromCozy = null;
    for (_i = 0, _len = cozyContacts.length; _i < _len; _i++) {
      cozyContact = cozyContacts[_i];
      if (CompareContacts.isSamePerson(cozyContact, fromGoogle)) {
        fromCozy = cozyContact;
        log.debug("" + (fromCozy != null ? fromCozy.fn : void 0) + " is same person");
        break;
      }
    }
    if ((fromCozy != null) && (fromCozy.getAccount(GCH.ACCOUNT_TYPE, accountName) == null)) {
      log.info("Link " + gId + " to google account");
      log.debug("Link " + (fromCozy != null ? fromCozy.fn : void 0) + " to google account");
      return updateContact(fromCozy, fromGoogle);
    } else {
      log.info("Create " + gId + " contact");
      log.debug("Create " + (fromGoogle != null ? fromGoogle.fn : void 0) + " contact");
      fromGoogle.revision = new Date().toISOString();
      return Contact.create(fromGoogle, endSavePicture);
    }
  }
};
