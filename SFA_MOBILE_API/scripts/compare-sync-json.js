const fs = require('fs');

const [prodPath, nodePath] = process.argv.slice(2);

if (!prodPath || !nodePath) {
  console.error('Usage: node scripts/compare-sync-json.js <production.json> <node.json>');
  process.exit(1);
}

const prodText = fs.readFileSync(prodPath, 'utf8');
const nodeText = fs.readFileSync(nodePath, 'utf8');
const prod = JSON.parse(prodText);
const node = JSON.parse(nodeText);

const importantKeys = [
  'CustomerMaster',
  'routesequence',
  'salescalender',
  'ItemMaster',
  'itemgroup',
  'itemnrp',
  'custnrp',
  'pricingdetail1',
  'customerpricing1',
  'productgroupheader',
  'productgroupdetail',
  'promokeyheader',
  'promokeydetail',
  'promoplanheader',
  'promoplandetail',
  'promotionassignmentadvanced',
  'customerinvoice',
  'customer_foc_balance',
  'customeritemmap',
  'synccount'
];

function arrayCount(value) {
  if (value === undefined) return 'MISSING';
  return Array.isArray(value) ? value.length : 1;
}

function allFields(rows) {
  const fields = new Set();
  for (const row of rows || []) {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      for (const key of Object.keys(row)) fields.add(key);
    }
  }
  return [...fields];
}

function keyValue(row, candidates) {
  if (!row || typeof row !== 'object') return undefined;
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
}

function idSet(rows, candidates) {
  return new Set(
    (rows || [])
      .map((row) => keyValue(row, candidates))
      .filter((value) => value !== undefined)
      .map(String)
  );
}

function printTopLevel() {
  const prodKeys = Object.keys(prod);
  const nodeKeys = Object.keys(node);
  console.log(`PROD_KEYS=${prodKeys.length}`);
  console.log(`NODE_KEYS=${nodeKeys.length}`);
  console.log(`ONLY_PROD=${prodKeys.filter((key) => !nodeKeys.includes(key)).join(',')}`);
  console.log(`ONLY_NODE=${nodeKeys.filter((key) => !prodKeys.includes(key)).join(',')}`);
  console.log('\nCOUNTS_DIFF');
  for (const key of [...new Set([...prodKeys, ...nodeKeys])].sort()) {
    const prodCount = arrayCount(prod[key]);
    const nodeCount = arrayCount(node[key]);
    if (prodCount !== nodeCount) {
      console.log(`${key}\tprod=${prodCount}\tnode=${nodeCount}`);
    }
  }
}

function printFieldDiffs() {
  console.log('\nFIELD_DIFFS');
  for (const key of importantKeys) {
    const prodFields = allFields(prod[key]);
    const nodeFields = allFields(node[key]);
    const onlyProd = prodFields.filter((field) => !nodeFields.includes(field));
    const onlyNode = nodeFields.filter((field) => !prodFields.includes(field));
    console.log(`\n# ${key} prod=${arrayCount(prod[key])} node=${arrayCount(node[key])}`);
    if (onlyProd.length > 0) console.log(`only_prod_fields=${onlyProd.join(',')}`);
    if (onlyNode.length > 0) console.log(`only_node_fields=${onlyNode.join(',')}`);
  }
}

function printIdDiff(label, candidates) {
  const prodIds = idSet(prod[label], candidates);
  const nodeIds = idSet(node[label], candidates);
  const onlyProd = [...prodIds].filter((id) => !nodeIds.has(id)).slice(0, 30);
  const onlyNode = [...nodeIds].filter((id) => !prodIds.has(id)).slice(0, 30);
  console.log(`\nID_DIFF ${label} by ${candidates.join('/')}`);
  console.log(`only_prod_sample=${onlyProd.join(',')}`);
  console.log(`only_node_sample=${onlyNode.join(',')}`);
}

function printSyncCountDiffs() {
  const prodMap = new Map(
    (prod.synccount || []).map((row) => [
      String(row.tablename ?? row.TABLENAME ?? row.tableName),
      row.tablecount ?? row.TABLECOUNT ?? row.TableCount
    ])
  );
  const nodeMap = new Map(
    (node.synccount || []).map((row) => [
      String(row.tablename ?? row.TABLENAME ?? row.tableName),
      row.tablecount ?? row.TABLECOUNT ?? row.TableCount
    ])
  );
  console.log('\nSYNCCOUNT_DIFF');
  for (const key of [...new Set([...prodMap.keys(), ...nodeMap.keys()])].sort()) {
    const prodCount = prodMap.get(key);
    const nodeCount = nodeMap.get(key);
    if (prodCount !== nodeCount) {
      console.log(`${key}\tprod=${prodCount}\tnode=${nodeCount}`);
    }
  }
}

function findCaseDuplicateFields(text, limit = 50) {
  const found = [];
  const objectRegex = /\{[^{}]*\}/g;
  let match;
  let index = 0;
  while ((match = objectRegex.exec(text)) && found.length < limit) {
    const names = [...match[0].matchAll(/"([^"]+)"\s*:/g)].map((item) => item[1]);
    const seen = new Map();
    for (const name of names) {
      const lowerName = name.toLowerCase();
      if (seen.has(lowerName) && seen.get(lowerName) !== name) {
        found.push({ object: index, first: seen.get(lowerName), second: name });
      } else {
        seen.set(lowerName, name);
      }
    }
    index += 1;
  }
  return found;
}

printTopLevel();
printFieldDiffs();
printSyncCountDiffs();
printIdDiff('CustomerMaster', ['customercode', 'CUSTOMERCODE']);
printIdDiff('ItemMaster', ['actualitemcode', 'ACTUALITEMCODE', 'itemcode', 'ITEMCODE']);
printIdDiff('routesequence', ['customercode', 'CUSTOMERCODE']);
printIdDiff('pricingdetail1', ['itemcode', 'ITEMCODE']);
console.log('\nCASE_DUPLICATES_NODE');
console.log(JSON.stringify(findCaseDuplicateFields(nodeText), null, 2));
