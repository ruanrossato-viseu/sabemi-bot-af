const moment = require("moment");
const process = require("process");

module.exports.workingHours = async function workingHours() {
    let hour = moment().hour();
    return utilDay(hour) 
}

function utilDay(hour) {
    return (hour >= 12 && hour < 21);
}