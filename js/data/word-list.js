/* word-list.js — curated commonly misspelled English words */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  SR.WORD_LIST = [
    /* 1–4 chars */
    'debt','knot','isle','heir','hymn','lynx','wrap','limb',
    'tomb','knee','lamb','comb','knob','knit','wren',
    /* 5 chars */
    'gauge','seize','yacht','rhyme','weird','queue','chaos','thyme',
    'naive','genre','plaid','siege','brief','chief','grief','niece',
    'piece','reign','feign','aisle','scene','sword','kneel','guile','psalm','corps',
    /* 6–7 chars */
    'rhythm','eighth','height','weight','tongue','plague','league',
    'opaque','unique','island','friend','pigeon','wholly','sleigh',
    'bureau','subtle','recipe','grieve','surgery','foreign','soldier',
    'special','science','silence','absence','ancient','address',
    'balloon','bargain','ceiling','captain','crystal','clothes',
    'country','culture','chapter','stomach','colonel','journey',
    'courage','succeed','forty','autumn','muscle','chorus',
    /* 8–10 chars */
    'separate','schedule','surprise','marriage','calendar','category',
    'occurred','received','believed','achieved','audience','guidance',
    'nuisance','patience','distance','familiar','peculiar','exercise',
    'organize','language','medicine','presence','terrible','horrible',
    'business','caffeine','chocolate','committee','conscious','defendant',
    'desperate','dilemma','disappear','discipline','dominant','dumbbell',
    'efficient','embarrass','guarantee','lightning','maneuver','miniature',
    'necessary','neighbor','gorgeous','misspell',
    'mortgage','scissors','sergeant','sincerely','relevant','referred',
    'suppress','sentence','daughter','perceive','precede',
    'pastime','strength','judgment','knowledge','jealous','humorous',
    'February','leisurely','camouflage',
    /* 11+ chars */
    'accommodate','accidentally','acquaintance','advertisement',
    'bureaucracy','archaeology','Caribbean','cemetery',
    'chauffeur','courageous','counterfeit','definitely',
    'descendant','difference','disappoint','embarrassment',
    'encouragement','environment','exhilarate','existence',
    'experience','extraordinary','fascinate','government',
    'harassment','hierarchy','immediately','independent',
    'indispensable','intelligence','irresistible','Mediterranean',
    'millennium','mischievous','mysterious','noticeable',
    'occasionally','occurrence','opportunity','outrageous',
    'parallel','particularly','perseverance','personnel',
    'possession','pronunciation','questionnaire','recommend',
    'religious','restaurant','ridiculous','sacrifice',
    'secretary','specifically','supersede','suspicious',
    'technical','temperature','threshold','tomorrow',
    'tyranny','unanimous','unnecessary','vengeance',
    'villain','Wednesday','correspondence','comfortable',
    'maintenance','permissible','prejudice','surveillance',
    'privilege','souvenir','twelfth','vacuum','aggressive',
  ];

  SR.getLengthCategory = function (word) {
    const len = word.length;
    if (len <= 4)  return '1-4';
    if (len <= 7)  return '5-7';
    if (len <= 10) return '8-10';
    return '11+';
  };
})();
