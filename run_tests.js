const test = require('node:test');
const fs = require('fs')
const path = require('node:path')
const assert = require('assert');
const reports = path.join(__dirname, "/reports");
const analyze = require("./analyze.js");

safes = ["2 6 3 5 7", "4 8 7 5 3", "7 6 4 2 1", "1 3 6 7 9", "8 6 4 4 1", "87 85 87 90 93", "54 56 55 58 61",
            "24 21 20 18 17 18", "90 93 95 92 98","48 46 47 49 51 54 56"  ,"1 1 2 3 4 5","1 2 3 4 5 5",
            "5 1 2 3 4 5","1 4 3 2 1"  ,"1 6 7 8 9","1 2 3 4 3","9 8 7 6 7","7 10 8 10 11","29 28 27 25 26 25 22 20"];

not_safes =[ "9 7 6 2 1", "1 2 7 8 9", "29 31 37 38 40 43 45 46", "9 8 7 7 7"];

function isStrictlyIncreasing(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] >= arr[i + 1]) return false;
    }
    return true;
}

function isStrictlyDecreasing(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] <= arr[i + 1]) return false;
    }
    return true;
}

function iswithinThree(arr) {
    for (let i = 1; i < arr.length - 1; i++) {
        let diff = Math.abs(arr[i]-arr[i - 1]);
        if (diff>3 || diff<1){
            console.log(arr);
            return false;
        }
    }
    return true;
}

function test_corrects(arg){
    let report_dir= path.join(__dirname, "/reports/");
    let fil = path.join(report_dir, arg+".txt")
    const reports = fs.readFileSync(fil).toString('UTF8').split('\n');
    reports.forEach((report) => {
        test('test final report good', async (t) => {
            let levelstrings = report.split(" ");
            let levels = levelstrings.map(Number);
            let inc = isStrictlyIncreasing(levels);
            let dec = isStrictlyDecreasing(levels);
            let within = iswithinThree(levels);
            assert.strictEqual((inc || dec) && within, true);
        });
    });
}

function runAllTests(){
    test('test safe 4', async (t) => {
        await t.test('test safe 4', (t) => {
            let safe = analyze.analyze_reports(path.join(reports,"safe_4.txt"));
            console.log(`\n${safe} reports are safe\n`);
            assert.strictEqual(safe, 4);
        });
    });
    test('test safe 10', async (t) => {
        await t.test('test safe 10', (t) => {
            let safe = analyze.analyze_reports(path.join(reports,"safe_10.txt"));
            console.log(`\n${safe} reports are safe\n`);
            assert.strictEqual(safe, 10);
        });
    });
    test('test safes', async (t) => {
        for (const [index, r] of safes.entries()) {
            await t.test(`test safe ${index}`, (t) => {
                let safe = analyze.is_report_safe(r);
                assert.strictEqual(safe, true);
                console.log(`\n assert safe report ${index} is safe\n`);
            });
        }
    });
    test('test not safes', async (t) => {
        for (const [index, r] of not_safes.entries()) {
            await t.test(`test not safe ${index}`, (t) => {
                let safe = analyze.is_report_safe(r);
                assert.strictEqual(safe, false);
                console.log(`\n assert safe report ${index} is safe\n`);
            });
        }
    });
}

if (require.main === module) {
    let arg = process.argv[2];
    if (arg) test_corrects(arg);
    else{
        runAllTests();
    }

}
