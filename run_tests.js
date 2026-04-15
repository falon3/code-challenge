const test = require('node:test');
const path = require('node:path')
const assert = require('assert');
const reports = path.join(__dirname, "/reports");
const analyze = require("./analyze.js");

safes = ["7 6 4 2 1", "1 3 6 7 9", "1 3 2 4 5", "8 6 4 4 1", "87 85 87 90 93", "54 56 55 58 61",
            "24 21 20 18 17 18", "90 93 95 92 98"   ,"48 46 47 49 51 54 56"  ,"1 1 2 3 4 5","1 2 3 4 5 5",
            "5 1 2 3 4 5","1 4 3 2 1"  ,"1 6 7 8 9","1 2 3 4 3","9 8 7 6 7","7 10 8 10 11","29 28 27 25 26 25 22 20"];

not_safes =["9 7 6 2 1", "8 6 4 4 1", "1 3 2 4 5", "1 2 7 8 9", "87 87 85 87 90 93", "80 87 90 91 91 93 91", "45 42 43 45 50 5"];

function runAllTests(){
    test('test 1', async (t) => {
        await t.test('test 1', (t) => {
            let safe = analyze.analyze_reports(path.join(reports,"test_1.txt"));
            console.log(`\n${safe} reports are safe\n`);
            assert.strictEqual(safe, 4);
        });
    });

    test('test 1 safes', async (t) => {
        for (const [index, r] of safes.entries()) {
            await t.test(`test safe ${index}`, (t) => {
                let safe = analyze.is_report_safe(r);
                assert.strictEqual(safe, true);
                console.log(`\n assert safe report ${index} is safe\n`);
            });
        }
    });
}

if (require.main === module) {
    runAllTests();
}
