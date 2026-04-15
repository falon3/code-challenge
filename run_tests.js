const test = require('node:test');
const path = require('node:path')
const assert = require('assert');
const reports = path.join(__dirname, "/reports");
const analyze = require("./analyze.js");

safes = ["7 6 4 2 1", "1 3 6 7 9", "50 53 56 59 61 64 67"];

not_safes =["9 7 6 2 1", "8 6 4 4 1", "1 3 2 4 5", "1 2 7 8 9", "80 87 90 91 91 93 91", "45 42 43 45 50 5"];

function runAllTests(){
    test('test 1', async (t) => {
        await t.test('test 1', (t) => {
            let safe = analyze.analyze_reports(path.join(reports,"test_1.txt"));
            console.log(`\n${safe} reports are safe\n`);
            assert.strictEqual(safe, 2);
        });
    });

    test('test 1 safes', async (t) => {
        for (const [index, r] of safes.entries()) {
            await t.test(`test safe ${index}`, (t) => {
                let safe = analyze.is_report_safe(r);
                assert.strictEqual(safe, true);
                console.log(`\n assert ${index} report is safe\n`);
            });
        }
    });
}

if (require.main === module) {
    runAllTests();
}
