const fs = require('fs')
const path = require('node:path')
const reports = path.join(__dirname, "/reports");
const DEFAULT_REPORT = "real.txt"

function report_unsafe(report, why){
    console.log(`${report} is Unsafe because ${why}`);
}

function direction_changes(last_diff, next_diff){
    return ((last_diff<=0 && next_diff>=0) || (last_diff>=0 && next_diff<=0))
}

function last_diff_good(last_diff){
    if (Math.abs(last_diff)<1 || Math.abs(last_diff)>3) return false;
    else return true;
}

function is_report_safe(report, removed=null, original=null){
    let diff_fail = "do not differ by at least one and at most three";
    let levelstrings = report.split(" ");
    let levels = levelstrings.map(Number);
    //if (removed) console.log("trying ", levels, " with removed ", removed);
    for (const [pos, cur_level] of levels.entries()) {
        if (pos==0) continue;
        let at_end = (pos>=levels.length-1);
        let last_diff = cur_level - levels[pos-1];
        let next_diff = at_end ? null : (levels[pos+1]- cur_level);
        if (at_end) {
            //at end if last diff good make the classification
            if (!last_diff_good(last_diff)){ //36, 40, 42, 43
                if (removed=== null) {
                    removed = levels[pos];
                    levels.splice(pos, 1);
                    original = report;
                    report = levels.join(" ");
                }
                else{
                    report_unsafe(original, `adjacent levels ${cur_level} ${levels[pos-1]} ${diff_fail}`);
                    return false;
                }
            }
            if (original=== null) original = report;
            //console.log(report);//, " - ", original); //DEBUG correct
            console.log(`${original} is Safe with ${removed} removed so ${report}`);
            return true;
        }
        else{ //check direction first?
            if (direction_changes(last_diff,next_diff)){
                if (removed=== null) {
                    let placement = pos < (levels.length - 1) / 2 ? -1 : 1; //first or 2nd half
                    let to_rem = pos;
                    if (placement<0){ //look ahead if safe
                        if (pos+2 < levels.length) {
                            if ((levels[pos+2] < levels[pos+1]) && (last_diff>0) ){ //general dec
                                if (levels[pos-1] <= levels[pos+1]) to_rem=pos-1;
                            }
                            else if ((levels[pos+2] > levels[pos+1]) && last_diff<0){ //general inc
                                if (levels[pos-1] >= levels[pos+1]) to_rem=pos-1;
                            }
                        }
                    }
                    else{ //look back if safe
                        if (pos-2 >= 0) {
                            if((levels[pos-2] < levels[pos-1]) && next_diff<0){ //gen incr
                                if (levels[pos+1] <= levels[pos-1]) to_rem=pos+1;
                            }
                            else if ((levels[pos-2] > levels[pos-1]) && next_diff>0){ //gen dec
                                if (levels[pos+1] >= levels[pos-1]) to_rem=pos+1;
                            }
                        }
                    }
                    removed = levels[to_rem];
                    levels.splice(to_rem, 1);
                    return is_report_safe(levels.join(" "), removed, report);
                }
                else { //put old one back take next?
                    report_unsafe(original, `all levels are not either all increasing or all decreasing`);
                    return false;
                }
            }
            if (!last_diff_good(last_diff)){
                if (removed=== null) { //3 2 3 5 7 // 4 5 9 7 3 // 5 1 2 3 4 5 //2 7 8
                    removed = levels[pos-1];
                    levels.splice(pos-1, 1);
                    return is_report_safe(levels.join(" "), removed, report);
                }
                else {
                    report_unsafe(original, `adjacent levels ${cur_level} ${levels[pos-1]} ${diff_fail}`);
                    return false;
                }
            }
        }
        //otherwise continue could be safe....
    };
}

function analyze_reports(reports_file){
    const reports = fs.readFileSync(reports_file).toString('UTF8').split('\n');
    const num_reports = reports.length;
    let safe = 0;
    let fail = 0;
    console.log(`${num_reports} reports to analyze\n`);
    reports.forEach((report) => {
        if (is_report_safe(report)) safe+=1;
        else fail+=1;
    });
    console.log(fail, " failed reports");
    return safe;
}

// give new test report name to run on as arg or default run on real. 328 is too low for other.. NOT 334??
if (require.main === module) {
    let report_dir= path.join(__dirname, "/reports/");
    let arg = !process.argv[2] ? path.join(report_dir, DEFAULT_REPORT) : path.join(report_dir, process.argv[2]+".txt");
    let safe = analyze_reports(arg);
    console.log(`\n${safe} reports are safe\n`);
    return
}

//for tests //higher than 603? but not 605 or 604 NOT 657 NOT 610 NOT 611
module.exports = {
    analyze_reports,
    is_report_safe
}
