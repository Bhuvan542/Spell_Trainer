/* word-list.js — curated commonly misspelled English words */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  SR.WORD_LIST = [
    /* 1–4 chars */
    'debt','knot','isle','heir','hymn','lynx','wrap','limb',
    'tomb','knee','lamb','comb','knob','knit','wren','ache',
    'aunt','beef','calf','chef','clue','coup','czar',
    'dais','echo','envy','ewe','faze','feat','flea','foal',
    'foul','gist','gnat','gnaw','goes','hoof','hour','kiwi',
    'knew','lair','leaf','lien','loaf','lyre','maze','meat',
    'mews','oath','oboe','ogle','omen','ovum','palm','pint',
    'poem','pour','prey','psst','quay','read','reef','roux',
    'seam','sewn','sloe','sole','soup','sure','tact','taut',
    'thaw','veil','vein','yoke','yolk','yore','zest',
    /* 5 chars */
    'gauge','seize','yacht','rhyme','weird','queue','chaos','thyme',
    'naive','genre','plaid','siege','brief','chief','grief','niece',
    'piece','reign','feign','aisle','scene','sword','kneel','guile','psalm','corps',
    /* Additional 5 chars */

'abide','adieu','adobe','adopt','agile','aglow','agony','algae',
'align','aloud','amend','among','angel','ankle','annex','apron',
'arbor','argue','arise','armor','aroma','array','arrow','asset',
'atlas','attic','audio','avail','awful','awoke','axiom','azure',

'bacon','badge','bagel','belle','berth','binge','birch','blitz',
'blown','booth','borne','boule','brace','braid','brooch','broth',
'brute','build','built','buyer','bylaw',

'cabin','cacao','cache','camel','cargo','carol','carve','caste',
'catch','cause','cedar','chalk','chant','chaos','chasm','cheek',
'cheer','chess','chili','choir','choke','chord','chute','civic',
'cough','could','count','court','covet','crane','creek','crept',
'cried','cruel','crumb','crush','crypt','cynic',

'dairy','daisy','dealt','debut','decal','decoy','defer','deity',
'delta','dense','depth','diary','digit','dodge','doubt','dough',
'dowel','dozen','draft','drain','dread','dream','dress','dried',
'drier','drift','drove','drown','dwarf',

'eager','eagle','early','earth','ebony','edict','eight','elite',
'elope','elude','email','ember','empty','enact','enjoy','ensue',
'entry','epoch','equip','erase','erect','error','essay','ether',
'ethic','evade','event','every','evoke','exact','exalt','excel',
'exert','exile','exist','expel','extra',

    /* 6–7 chars */
    /* Additional 6–7 chars */

'absurd','accept','across','advice','advise','allege','almost',
'always','anchor','answer','appeal','appear','arrange','arrived',
'asthma','author','backup','behalf','belief','breath','breathe',
'bullet','buried','camera','cancel','cannot','career','careful',
'carried','ceiling','central','century','certain','charity',
'chimney','circuit','citizen','college','command','comment',
'company','compare','compete','complex','concern','confirm',
'connect','contain','control','correct','cousin','creator',
'cruelty','crystal','curtain','custody','declare','deliver',
'deserve','develop','diamond','disease','distant','drunken',
'dynamic','eastern','edition','educate','elderly','electric',
'element','emotion','emperor','enough','examine','example',
'except','excited','explain','explore','factory','failure',
'fashion','fatigue','feature','fiction','finance','finally',
'forward','fragile','freight','gallery','general','genuine',
'grammar','harbour','healthy','hearing','heaven','holiday',
'honesty','honour','imagine','improve','include','income',
'increase','instead','jealous','journey','justice','kitchen',
'library','machine','manager','measure','message','million',
'mineral','miracle','mixture','monitor','musical','natural',
'neither','nervous','nuclear','officer','opinion','package',
'painful','passage','patient','pattern','payment','penalty',
'penguin','perhaps','picture','plastic','popular','possess',
'predict','prepare','present','prevent','primary','printer',
'problem','process','produce','promise','protect','purpose',
'quality','quarter','quietly','railway','realise','receipt',
'receive','recover','reflect','regular','related','release',
'remains','removal','replace','request','require','respect',
'respond','restore','retired','reverse','safeguard','satisfy',
'scholar','section','serious','service','several','shoulder',
'silence','similar','society','soldier','special','station',
'strange','student','success','support','suppose','surface',
'survive','teacher','through','towards','traffic','trouble',
'typical','uniform','unusual','variety','vehicle','village',
'violent','visitor','weather','welcome','whether','without',
'writing',
    /* 8–10 chars */
    /* Additional 8–10 chars */

'abilities','abnormal','abundance','accelerate','accessible','accidental',
'accurately','admission','adventure','afternoon','agreement','algorithm',
'allegedly','allowance','alongside','alternate','amazement','ambiguous',
'ambitious','amendment','amphibian','anniversary','anonymous','apartment',
'apologize','apparatus','appointed','appreciate','architect','arithmetic',
'artificial','assistant','associate','attention','attribute','authority',

'backwards','beautiful','benefited','breakfast','brilliant','broadcast',
'cafeteria','candidate','carefully','celebrate','ceremony','challenge',
'character','chemistry','childhood','cigarette','classroom','classical',
'colleague','collision','commercial','community','comparison','complaint',
'completely','complicate','component','condition','conference','confidence',
'confusion','consider','consistent','constant','construct','continuous',
'contribute','convenient','cooperate','copyright','countryside','creature',

'dangerous','daughter','decision','decorate','dedicated','delicious',
'dependent','describe','designer','determine','dictionary','different',
'difficult','direction','discovery','discussion','education','effective',
'efficiently','election','emergency','emotional','emphasize','employee',
'encounter','encourage','engineer','enormous','enthusiasm','equipment',
'especially','essential','excellent','exception','expensive','expression',

'fantastic','favourite','financial','foundation','friendship','furniture',
'generally','generation','government','graduate','happiness','historical',
'hospital','identify','important','impossible','impression','improvement',
'individual','influence','information','ingredient','instruction',
'intelligent','interesting','interview','knowledge','laboratory','leadership',

'literature','magazine','mechanism','membership','microphone','millimeter',
'newspaper','nightmare','objective','operation','opposition','organiser',
'passenger','perfection','performance','permission','personally','photograph',
'playground','pollution','population','portfolio','practical','preference',
'president','principal','principle','procedure','profession','professor',
'programme','promotion','protection','psychology','punishment',

'realistic','recognise','reference','reflection','registered','remembered',
'reputation','research','residence','resource','restaurant','satisfied',
'scientific','signature','situation','something','statement','successful',
'suggestion','telephone','therefore','throughout','tournament','transport',
'treatment','understand','university','vegetable','volunteer','wonderful',
'workplace',
    /* 11+ chars */
    /* Additional 11+ chars */

'administration','acknowledgement','agricultural','alphabetical',
'alternatively','announcement','anthropology','anticipation',
'approachable','approximately','astonishing','authentication',

'biodegradable','biotechnology',

'categorically','characteristic','circumstance','collaboration',
'communication','compartment','compassionate','compensation',
'comprehensive','concentration','configuration','confirmation',
'congratulate','consequence','consideration','constitutional',
'construction','contemporary','contradiction','controversial',
'conversation','coordination','credential','customization',

'decentralization','declaration','decomposition','demonstration',
'determination','developmental','diagnostician','disagreement',
'disappointment','disciplinary','discrimination','disproportionate',
'documentation',

'electromagnetic','encyclopedia','entrepreneur','establishment',
'exaggeration','exceptionally','extraordinary',

'fundamentally',

'headquarters','heterogeneous','humanitarian','hypothetically',

'identification','implementation','inappropriate','inconvenience',
'incorporation','indefinitely','independence','indistinguishable',
'industrialization','inevitable','infrastructure','institution',
'instrumentation','intellectual','intermediate','interpretation',
'interruption','investigation',

'jurisdiction',

'knowledgeable',

'manufacturing','mathematically','misunderstanding','multidisciplinary',

'neighbourhood','nonetheless',

'organizational','overwhelming',

'participation','pharmaceutical','philosophical','photosynthesis',
'possibilities','professional','procrastination','pronounceable',
'psychological','psychotherapist',

'reconciliation','reconstruction','rehabilitation','relationship',
'representative','responsibility',

'satisfactory','simultaneously','sophisticated','straightforward',
'strengthening','substantially','superintendent',

'telecommunication','thermodynamics','transportation',

'uncharacteristic','understanding','unforgettable','unpredictable',
'unprofessional',

'visualization','vulnerability',
  ];

  SR.getLengthCategory = function (word) {
    const len = word.length;
    if (len <= 4)  return '1-4';
    if (len <= 7)  return '5-7';
    if (len <= 10) return '8-10';
    return '11+';
  };
})();
