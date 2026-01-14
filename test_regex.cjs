const fs = require('fs');

const html = fs.readFileSync('debug_dump.html', 'utf-8');

console.log('Testing regex patterns...\n');

// Pattern 1: Current pattern
const pattern1 = /window\.__PRELOADED_STATE__\s*=\s*(\{.+?\});/s;
const match1 = html.match(pattern1);
console.log('Pattern 1 (current):', match1 ? 'MATCHED' : 'NO MATCH');

// Pattern 2: Without escaping the dot
const pattern2 = /window.__PRELOADED_STATE__\s*=\s*(\{.+?\});/s;
const match2 = html.match(pattern2);
console.log('Pattern 2 (no escape):', match2 ? 'MATCHED' : 'NO MATCH');

// Pattern 3: More flexible
const pattern3 = /__PRELOADED_STATE__\s*=\s*(\{.+?\});/s;
const match3 = html.match(pattern3);
console.log('Pattern 3 (flexible):', match3 ? 'MATCHED' : 'NO MATCH');

if (match3) {
    const data = JSON.parse(match3[1]);
    console.log('\nExtracted data:');
    console.log('Price:', data?.mainStocksPriceBoard?.priceBoard?.price);
    console.log('Change:', data?.mainStocksPriceBoard?.priceBoard?.priceChange);
    console.log('ChangeRate:', data?.mainStocksPriceBoard?.priceBoard?.priceChangeRate);
}
