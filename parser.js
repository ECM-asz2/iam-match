const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const output = Array.of(Array.of('VKORG_top', 'VKORG_bottom'));

// Read content
const content = fs.readFileSync('iam.csv', 'latin1');
// Parse CSV content
const records = parse(content, {columns: true, relax_column_count: true, delimiter: ';'});
// Show number of records
console.log(records.length);
// For each line that has a structural node, collect all VkOrg and Strukturknoten
records.forEach(row => {
  if(row.Strukturknoten !== '') {
    if(row.Objektkürzel.length === 4 && row.Objektkürzel.endsWith('00')) {
      scanForStructuralNode(row.Objektkürzel.substring(0,2), row.Strukturknoten, records);
    } else {
      scanForStructuralNode(row.Objektkürzel, row.Strukturknoten, records);
    }
  }
});
console.log(output);
// Generate output CSV
const csv = stringify(output, {delimiter: ';'});
fs.writeFileSync('output.csv', csv);

function scanForStructuralNode(objectShortName, currentStructuralNode, allRecords) {
  const tempResult = [];
  let tempOutput = [];
  // Show current structural node that we're looking at
  console.log(currentStructuralNode, ":");
  // Scan all rows that start with given objectShortName
  allRecords.forEach(row => {
    if(row.Objektkürzel.startsWith(objectShortName)) {
      // *00 VkOrgs are only valid for 4+ digit structural nodes, since they are translated to * in ECM
      if(row.VkOrg1.substring(2) !== '00' || objectShortName.length < 4) {tempResult.push(row.VkOrg1)}
      if(row.VkOrg2.substring(2) !== '00' || objectShortName.length < 4) {tempResult.push(row.VkOrg2)}
      if(row.VkOrg3.substring(2) !== '00' || objectShortName.length < 4) {tempResult.push(row.VkOrg3)}
      tempResult.push(row.Strukturknoten);
    }
  })
  // Remove duplicates, filter empty items and sort array
  tempOutput = Array.from(new Set(tempResult)).filter(item => item).sort();
  console.log(tempOutput);
  // Add items to output array
  tempOutput.forEach(row => {
    output.push(Array.of(currentStructuralNode, row));
  })
}

