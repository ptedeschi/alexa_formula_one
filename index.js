
const Alexa = require('ask-sdk-core');
const syncrequest = require("sync-request");
const moment = require('moment');
const util = require("util");

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome, I can provide data for the Formula One series, from the beginning of the world championships in 1950. Ask me a few questions...';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// alexa ask formula one how many points has vettel
const DriverStandingIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'DriverStandingIntent'
            && handlerInput.requestEnvelope.request.intent.slots.Driver.value;
    },
    handle(handlerInput) {
        const driverId = handlerInput.requestEnvelope.request.intent.slots.Driver.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        const driverName = handlerInput.requestEnvelope.request.intent.slots.Driver.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        var res = syncrequest('GET', 'http://ergast.com/api/f1/current/drivers/' + driverId + '/driverStandings.json');
        console.log(res.getBody());
        
        var json = JSON.parse(res.getBody());
		var points = json.MRData.StandingsTable.StandingsLists[0].DriverStandings[0].points;
		var position = json.MRData.StandingsTable.StandingsLists[0].DriverStandings[0].position;
        
        const speechText = driverName + " has " + points + " points and is in <say-as interpret-as='ordinal'>" + position + "</say-as> on the championship";
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

// alexa ask formula one who won the latest race
const LatestWinnerIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'LatestWinnerIntent'
    },
    handle(handlerInput) {
        var res = syncrequest('GET', 'http://ergast.com/api/f1/current/last/results.json');
        console.log(res.getBody());

        var json = JSON.parse(res.getBody());
		
		var first = json.MRData.RaceTable.Races[0].Results[0].Driver.givenName + " " + json.MRData.RaceTable.Races[0].Results[0].Driver.familyName;
		var second = json.MRData.RaceTable.Races[0].Results[1].Driver.givenName + " " + json.MRData.RaceTable.Races[0].Results[1].Driver.familyName;
		var third = json.MRData.RaceTable.Races[0].Results[2].Driver.givenName + " " + json.MRData.RaceTable.Races[0].Results[2].Driver.familyName;
        
        const speechText = "The latest race ends with " + first + ", then " + second + " and " + third;
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

// alexa ask formula one when is the next race
const NextRaceIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'NextRaceIntent'
    },
    handle(handlerInput) {
        var res = syncrequest('GET', 'http://ergast.com/api/f1/current/next.json');
        console.log(res.getBody());

        var json = JSON.parse(res.getBody());
        var raceName = json.MRData.RaceTable.Races[0].raceName;
        var date = json.MRData.RaceTable.Races[0].date;
        var now = moment(new Date());
        var end = moment(date);
        var duration = moment.duration(now.diff(end));
        var days = Math.abs(duration.asDays());
        days = Math.trunc(days);
        
        const speechText = raceName + " in " + days + " days";
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

// alexa ask formula one what is the sound of a Formula One car
const FormulaOneSoundIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FormulaOneSoundIntent'
    },
    handle(handlerInput) {
        const speechText = "<speak>Here's what a F1 Cars sound like.<audio src='https://myalexastorage.blob.core.windows.net/container/formula_one_motor_sound.mp3'/></speak>";
        const speechRepromptText = "Would you like to hear it again?";
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechRepromptText)
            .getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        DriverStandingIntentHandler,
        LatestWinnerIntentHandler,
        NextRaceIntentHandler,
        FormulaOneSoundIntentHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
