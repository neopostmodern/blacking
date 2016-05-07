"use strict";

/**
 * @return {string}
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Blacking = function Blacking(text, user) {
  var regex = /\[([^\]]*)\]\{([^\}]+)\}/g;
  var match = void 0;
  var nothingMatched = true;
  var endOfPreviousMatch = 0;
  var result = "";

  while ((match = regex.exec(text)) !== null) {
    nothingMatched = false;

    var rules = Blacking.ruleParser(match[1]);
    var content = match[2];

    result += text.substring(endOfPreviousMatch, match.index);

    var shouldBeBlacked = false;

    if (rules.allowed.length || rules.denied.length) {
      if (user.groups) {
        if (rules.allowed.some(function (group) {
          return user.groups.includes(group);
        }) || rules.allowed.length == 0) {
          if (rules.denied.some(function (group) {
            return user.groups.includes(group);
          })) {
            shouldBeBlacked = true;
          }
        } else {
          shouldBeBlacked = true;
        }
      } else {
        shouldBeBlacked = true;
      }
    }

    if (shouldBeBlacked) {
      if (rules.blackingCharacter) {
        result += content.replace(/[^\s,\?\.:!\-\(\)]/g, rules.blackingCharacter);
      }
    } else {
      result += content;
    }

    endOfPreviousMatch = regex.lastIndex;
  }

  if (nothingMatched) {
    return text;
  }

  return result;
};

Blacking.ruleParser = function (rulesString) {
  var results = {
    allowed: [],
    denied: [],
    blackingCharacter: ''
  };
  rulesString.split(' ').forEach(function (ruleString) {
    switch (ruleString.charAt(0)) {
      case '+':
        results.allowed.push(ruleString.substr(1));
        break;
      case '-':
        results.denied.push(ruleString.substr(1));
        break;
      case '=':
        if (results.blackingCharacter.length > 0) {
          console.warn("Duplicate declaration of blacking character: \"" + ruleString.substr(1) + "\" replaces \"" + results.blackingCharacter + "\"");
        }
        results.blackingCharacter = ruleString.substr(1);
        break;
      case '':
        // allow empty rule sets
        break;
      default:
        console.warn("Unsupported rule for Privatization: " + ruleString);
    }
  });
  return results;
};

exports.default = Blacking;

//# sourceMappingURL=blacking-compiled.js.map