"use strict";

const MARKDOWN_SPECIAL_CHARACTERS = ['*'];

/**
 * @return {string}
 */
var Blacking = function(text, user) {
  let regex = /\[([^\]]*)\]\{([^\}]+)\}/g;
  let match;
  let nothingMatched = true;
  let endOfPreviousMatch = 0;
  let result = "";

  while ((match = regex.exec(text)) !== null) {
    nothingMatched = false;

    let rules = Blacking.ruleParser(match[1]);
    let content = match[2];

    result += text.substring(endOfPreviousMatch, match.index);

    let shouldBeBlacked = false;

    if (rules.allowed.length || rules.denied.length) {
      if (user.groups) {
        if (rules.allowed.some((group) => user.groups.includes(group)) || rules.allowed.length == 0) {
          if (rules.denied.some((group) => user.groups.includes(group))) {
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
  } else {
    // add remaining text to the end
    result += text.substring(endOfPreviousMatch);
  }

  return result;
};

Blacking.ruleParser = function(rulesString) {
  let results = {
    allowed: [],
    denied: [],
    blackingCharacter: ''
  };
  rulesString.split(' ').forEach((ruleString) => {
    switch (ruleString.charAt(0)) {
      case '+':
        results.allowed.push(ruleString.substr(1));
        break;
      case '-':
        results.denied.push(ruleString.substr(1));
        break;
      case '=':
        if (results.blackingCharacter.length > 0) {
          console.warn(`Duplicate declaration of blacking character: "${ ruleString.substr(1) }" replaces "${ results.blackingCharacter }"`)
        }
        results.blackingCharacter = ruleString.substr(1);
        
        if (MARKDOWN_SPECIAL_CHARACTERS.includes(results.blackingCharacter)) {
          results.blackingCharacter = "\\" + results.blackingCharacter;
        }
        
        break;
      case '':
        // allow empty rule sets
        break;
      default:
        console.warn(`Unsupported rule for Privatization: ${ ruleString }`);
    }
  });
  return results;
};

module.exports = Blacking;