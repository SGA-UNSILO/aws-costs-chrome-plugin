'use strict';

self.setInterval(showVolumeCosts, 1000);

chrome.runtime.sendMessage({ebs: true}, function (ebsData) {
    writeEBSData(ebsData);
});

var uiToEBSJSONMap = new Map();
uiToEBSJSONMap.set("Magnetic", "standard");
uiToEBSJSONMap.set("General Purpose", "gp2");
uiToEBSJSONMap.set("Cold HDD", "sc1");
uiToEBSJSONMap.set("Provisioned IOPS", "io1");
uiToEBSJSONMap.set("Throughput Optimized HDD", "st1");

var ebsMap = {};

function writeEBSData(data) {
    for (const price of data.prices) {
        let type = price.attributes["aws:ec2:volumeType"];
        let cost = parseFloat(price.price.USD);

        if (uiToEBSJSONMap.has(type)) {
            ebsMap[uiToEBSJSONMap.get(type)] = cost;
        }
    }
}

function showVolumeCosts() {
    if(window.location.href.toString().indexOf("#LaunchInstanceWizard:") > -1) {
        $("select#volumeType").each(function (index, elm) {
            var sizeDiv = $(this).parent().parent().parent().parent().prev();
            const size = sizeDiv.find("input").first().val();
            const volumeType = $(this).val();

            var costPerMonth = 0;
            Object.keys(ebsMap).forEach(function (key) {
                if (volumeType.includes(key)) {
                    const costPerGB = ebsMap[key];
                    costPerMonth = costPerGB * size;
                }
            });

            if(!sizeDiv.find("div#aws-cost-div").length) {
                var innerSizeDiv = $(this).parent().parent().parent().parent().prev().find("input").first().parent();
                if (innerSizeDiv.text().indexOf("$") === -1) {
                    innerSizeDiv.append("<div id='aws-cost-div'></div>");
                }
            }

            sizeDiv.find("div#aws-cost-div").text(costPerMonth + "$ / month");
        });
    }
}