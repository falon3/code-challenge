const fs = require('fs')
const path = require('node:path')
const reports = path.join(__dirname, "/reports");
const DEFAULT_REPORT = "real.txt"

function report_unsafe(report, why){
    console.log(`${report} is Unsafe because ${why}`);
}

function is_report_safe(report){
    let diff_fail = "do not differ by at least one and at most three";
    let levels = report.split(" ");
    for (const [pos, cur_level] of levels.entries()) {
        if (pos==0) continue;
        let last_diff = (cur_level - levels[pos-1]);
        if (Math.abs(last_diff)<1 || Math.abs(last_diff)>3){
            report_unsafe(report, `adjacent levels ${cur_level} ${levels[pos-1]} ${diff_fail}`);
            return false;
        }
        if (pos>=levels.length-1) {
            //at end make the classification
            console.log(`${report} is Safe`);
            return true;
        }
        else{
            let next_diff = (levels[pos+1]- cur_level);
            if (Math.abs(next_diff)<1 || Math.abs(next_diff)>3){
                report_unsafe(report, `adjacent levels ${cur_level} ${levels[pos+1]} ${diff_fail}`);
                return false;
            }
            if ((last_diff<=0 && next_diff>=0) || (last_diff>=0 && next_diff<=0)){
                report_unsafe(report, `all levels are not either all increasing or all decreasing`);
                return false;
            }
        }
        //otherwise continue could be safe....
    };
}

function analyze_reports(reports_file){
    const reports = fs.readFileSync(reports_file).toString('UTF8').split('\n');
    const num_reports = reports.length-1;
    let safe = 0;
    console.log(`${num_reports} reports to analyze\n`);
    reports.forEach((report) => {
        if (is_report_safe(report)) safe+=1;
    });
    return safe;
}

// give new test report name to run on as arg or default run on real
if (require.main === module) {
    let report_dir= path.join(__dirname, "/reports/");
    let arg = !process.argv[2] ? path.join(report_dir, DEFAULT_REPORT) : path.join(report_dir, process.argv[2]+".txt");
    let safe = analyze_reports(arg);
    console.log(`\n${safe} reports are safe\n`);
    return
}

//for tests
module.exports = {
    analyze_reports,
    is_report_safe
}
