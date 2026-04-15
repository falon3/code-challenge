const fs = require('fs')
const path = require('node:path')
const reports = path.join(__dirname, "/reports");
const DEFAULT_REPORT = "real.txt"

function report_unsafe(report, why){
    console.log(`${report} is Unsafe because ${why}`);
}

function is_report_safe(report, removed=null, original=null){
    let diff_fail = "do not differ by at least one and at most three";
    let levelstrings = report.split(" ");
    let levels = levelstrings.map(Number);
    //if (removed) console.log("trying ", levels, " with removed ", removed);
    for (const [pos, cur_level] of levels.entries()) {
        if (pos==0) continue;
        let last_diff = cur_level - levels[pos-1];
        if (Math.abs(last_diff)<1 || Math.abs(last_diff)>3){
            if (removed=== null) {
                removed = levels[pos-1];
                levels.splice(pos-1, 1);
                return is_report_safe(levels.join(" "), removed, report);
            }
            else {
                //report_unsafe(original, `adjacent levels ${cur_level} ${levels[pos-1]} ${diff_fail}`);
                return false;
            }
        }
        if (pos>=levels.length-1) {
            //at end make the classification
            if (original=== null) original = report;
            console.log(`${original} is Safe with ${removed} removed`);
            return true;
        }
        else{
            let next_diff = (levels[pos+1]- cur_level);
            if (Math.abs(next_diff)<1 || Math.abs(next_diff)>3){
                if (removed=== null) {
                    removed = levels[pos+1];
                    levels.splice(pos+1, 1);
                    return is_report_safe(levels.join(" "), removed, report);
                }
                else{
                    //report_unsafe(original, `adjacent levels ${cur_level} ${levels[pos+1]} ${diff_fail}`);
                    return false;
                }
            }
            if ((last_diff<=0 && next_diff>=0) || (last_diff>=0 && next_diff<=0)){
                if (removed=== null) {
                    let direction = pos < (levels.length - 1) / 2 ? -1 : 1; //first or 2nd half
                    let to_rem = pos;
                    //console.log("workin on, ", levels, "to_rem", to_rem);
                    if (direction<0){ //look ahead if safe
                        //console.log("look ahead, ","last diff: ",last_diff, "next_diff: ", next_diff, "cur_pos: ", pos);
                        if (pos+2 < levels.length) {
                            if ((levels[pos+2] < levels[pos+1]) && (last_diff>0) ){ //general dec
                                //console.log("here1?", levels[pos+1] > levels[pos+2], levels[pos+2], levels[pos+1]);
                                if (levels[pos-1] <= levels[pos+1]) to_rem=pos-1;
                            }
                            else if ((levels[pos+2] > levels[pos+1]) && last_diff<0){ //general inc
                                //console.log("here2?");
                                if (levels[pos-1] >= levels[pos+1]) to_rem=pos-1;
                            }
                        }
                    }
                    else{ //look back if safe
                        //console.log("look back, ","last diff: ",last_diff, "next_diff: ", next_diff, "cur_pos: ", pos);
                        if (pos-2 >= 0) {
                            if((levels[pos-2] < levels[pos-1]) && next_diff<0){ //gen incr
                                if (levels[pos+1] <= levels[pos-1]) to_rem=pos+1;
                            }
                            else if ((levels[pos-2] > levels[pos-1]) && next_diff>0){ //gen dec
                                if (levels[pos+1] >= levels[pos-1]) to_rem=pos+1;
                            }
                        }
                    }
                    //console.log("to_rem", to_rem);
                    //let to_rem = (levels[pos-1]==levels[pos+1]) ? pos+(1*direction) : pos;
                    removed = levels[to_rem];
                    levels.splice(to_rem, 1);
                    levels = levels.join(" ");
                    //console.log("should try now, ", levels)
                    return is_report_safe(levels, removed, report);
                }
                else { //put old one back take next?
                    //levels.splice(pos+1, 1, removed);
                    //report_unsafe(original, `all levels are not either all increasing or all decreasing`);
                    return false;
                }
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

//for tests //higher than 603
module.exports = {
    analyze_reports,
    is_report_safe
}
