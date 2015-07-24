// Generated by CoffeeScript 1.9.3
var _extend, _union, hasField;

module.exports.isSamePerson = function(contact1, contact2) {
  return contact1.fn === contact2.fn && contact1.datapoints.some(function(field) {
    var ref;
    if ((ref = field.name) === 'tel' || ref === 'adr' || ref === 'email' || ref === 'chat') {
      return hasField(field, contact2);
    } else {
      return false;
    }
  });
};

hasField = function(field, contact, checkType) {
  if (checkType == null) {
    checkType = false;
  }
  if (field.value == null) {
    return false;
  }
  return contact.datapoints.some(function(baseField) {
    var i, ref, same;
    if (field.name === baseField.name && (!checkType || checkType && field.type === baseField.type) && (baseField.value != null)) {
      if (field.name === 'tel') {
        return field.value.replace(/[-\s]/g, '') === baseField.value.replace(/[-\s]/g, '');
      } else if (field.name === 'adr') {
        same = true;
        i = 0;
        while (same && i < 7) {
          same = same && field.value[i] === baseField.value[i] || field.value[i] === "" && (baseField.value[i] == null) || !((ref = field.value) != null ? ref[i] : void 0) && baseField.value[i] === "";
          i++;
        }
        return same;
      } else {
        return field.value === baseField.value;
      }
    } else {
      return false;
    }
  });
};

module.exports.mergeContacts = function(base, toMerge) {
  toMerge.datapoints.forEach(function(field) {
    if (!hasField(field, base, true)) {
      return base.datapoints.push(field);
    }
  });
  delete toMerge.datapoints;
  base.tags = _union(base.tags, toMerge.tags);
  delete toMerge.tags;
  base = _extend(base, toMerge);
  return base;
};

_union = function(a, b) {
  a = a || [];
  b = b || [];
  return a.concat(b.filter(function(item) {
    return a.indexOf(item) < 0;
  }));
};

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
