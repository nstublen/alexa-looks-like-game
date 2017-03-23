'use strict';

var Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');

var LooksLike = require("./handlers/LooksLike");

exports.handler = function(event, context, callback){

    console.log("event: " + JSON.stringify(event));
    console.log("context: " + JSON.stringify(context));

    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.dab62d88-29ad-4aac-8a7d-3658f8bfb677';

    alexa.registerHandlers(launchHandlers);

    alexa.execute();
};

var launchHandlers = {
    'LaunchRequest': function () {
        this.emitWithState("RandomSelectionIntent")
    },

    'DailySelectionIntent': function () {
        var now = new Date(this.event.request.timestamp);
        var start = new Date(2015, 0, 0, 5);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        var day = Math.floor(diff / oneDay);
        console.log('Day of year: ' + day);

        var index = day % LooksLike.Sayings.length;

        console.log("Selecting item " + index + " of " + LooksLike.Sayings.length);
        this.attributes["item"] = LooksLike.Sayings[index - 1];
        this.emitWithState("ItemSelectionIntent");
    },

    'IndexedSelectionIntent': function () {
        if (!this.event.request.intent.slots.hasOwnProperty("index") ||
            !this.event.request.intent.slots.index.hasOwnProperty("value")) {
            console.log("index slot is missing");
            this.emit(":tell", "I need a number between 1 and " + LooksLike.Sayings.length + ".");
            return;
        }

        var index = this.event.request.intent.slots.index.value;
        if (index < 1 || index > LooksLike.Sayings.length) {
            console.log("index = " + this.event.request.intent.slots.index.value);
            this.emit(":tell", "I need a number between 1 and " + LooksLike.Sayings.length + ".");
            return;
        }

        console.log("Selecting item " + index + " of " + LooksLike.Sayings.length);
        this.attributes["cardTitle"] = "Selection " + index + " of " + LooksLike.Sayings.length;
        this.attributes["item"] = LooksLike.Sayings[index - 1];
        this.emitWithState("ItemSelectionIntent");
    },

    'ItemSelectionIntent': function () {
        var item = this.attributes["item"];
        if (!item) {
            delete this.attributes["item"];
            this.emitWithState("RandomSelectionIndent");
            return;
        }

        var saying = item["saying"];
        if (item["phoneticName"]) {
            saying = saying.replace(item["name"], item["phoneticName"]);
        }

        var cardTitle = this.attributes["cardTitle"] || "Looks Like Game";
        var cardContent = item["saying"];
        var cardImageUrl = item.hasOwnProperty("imageUrl") ? item["imageUrl"] : undefined;
        var cardImage = { smallImageUrl: cardImageUrl, largeImageUrl: cardImageUrl };

        this.emit(':tellWithCard', saying, cardTitle, cardContent, cardImage);
    },

    'RandomSelectionIntent': function () {
        var index = Math.floor(Math.random() * LooksLike.Sayings.length);
        console.log("Selecting item " + (index + 1) + " of " + LooksLike.Sayings.length);
        this.attributes["cardTitle"] = "Random Selection";
        this.attributes["item"] = LooksLike.Sayings[index];
        this.emitWithState("ItemSelectionIntent");
    },

    'SpecificYearSelectionIntent': function () {
        if (!this.event.request.intent.slots.hasOwnProperty("year") ||
            !this.event.request.intent.slots.year.hasOwnProperty("value")) {
            this.emit(":tell", "I only have sayings from two thousand fifteen and later.");
            return;
        }

        var year = this.event.request.intent.slots.year.value.slice(0, 4);
        console.log("year = " + year);
        if (year == "") {
            this.emit(":tell", "You will need to specify a year, or you can just say, \"Alexa, play the looks like game.\"");
            return;
        }

        var filteredItems = LooksLike.Sayings.filter(function (a) { return a["date"] == year; });

        if (filteredItems.length == 0) {
            this.emit(":tell", "I only have sayings from two thousand fifteen and later.");
            return;
        }

        var index = Math.floor(Math.random() * filteredItems.length);
        console.log("Selecting item " + (index + 1) + " of " + filteredItems.length);
        this.attributes["cardTitle"] = "Selection from " + year;
        this.attributes["item"] = filteredItems[index];
        this.emitWithState("ItemSelectionIntent");
    },

    'AMAZON.CancelIntent': function () {
        this.emit(":tell", "Goodbye.");
    },

    'AMAZON.HelpIntent': function () {
        var helpPrompt = "The Looks Like game will randomly select a looks like " +
                         "saying from the Dan Lebatard Show with Stugotz. You can " +
                         "say, \"Alexa, play the looks like game.\"";
        this.emit(':tell', helpPrompt, helpPrompt);
    },

    'AMAZON.StartOverIntent': function () {
        this.emitWithState("RandomSelectionIntent");
    },

    'AMAZON.StopIntent': function () {
        this.emit(":tell", "Goodbye.");
    },

    'Unhandled': function() {
        var unrecognizedPrompt = "I didn't understand your request. You can " +
                                 "say, \"Alexa, play the looks like game.\"";
        this.emit(":tell", unrecognizedPrompt, unrecognizedPrompt);
    }
};
