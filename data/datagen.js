/**
 * Created by neal on 1/15/17.
 */

'use strict';

var excel = require("exceljs");
var fs = require("fs");

var xlFilename = "./data/LooksLike.xlsx";
var jsFilename = "./handlers/LooksLike.js";

var workbook = new excel.Workbook();
workbook.xlsx.readFile(xlFilename)
    .then(function() {
        var items = [];
        var years = {};
        var choruses = 0;

        var sheet = workbook.getWorksheet(1);
        var propertyNames = sheet.getRow(1);
        for (var rowIndex = 2; rowIndex <= sheet._rows.length; ++rowIndex) {
            var row = sheet.getRow(rowIndex);
            var nextItem = {};
            for (var colIndex = 1; colIndex <= row.values.length; ++colIndex) {
                var propertyName = propertyNames.getCell(colIndex).value;
                var propertyValue = row.getCell(colIndex).value;
                if (propertyName && propertyValue) {
                    if (typeof propertyValue == "saying") {
                        propertyValue = propertyValue.replace(/\r\n/g, " ");
                    }
                    nextItem[propertyName] = propertyValue;
                }
            }
            if (nextItem["include"] == "no") {
                console.log("Skip " + nextItem["name"]);
                continue;
            }
            if (nextItem["saying"]) {
                delete nextItem["include"];
                items.push(nextItem);
            }
        }

        console.log(items.length + " items");

        var text = "var Sayings = " + JSON.stringify(items, null, 2) + ";";
        text += "\n\nmodule.exports = { Sayings: Sayings };\n";
        fs.writeFile(jsFilename, text, function(error) {
            console.log("Sayings: " + items.length);
            console.log("Done");
        });
    });
