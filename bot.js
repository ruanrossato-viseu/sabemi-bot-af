//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the Sabemi Bot bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
//const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for web.

const { WebAdapter } = require('botbuilder-adapter-web');

//const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();

let request = require("request");

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
    });
}


const adapter = new WebAdapter({});


const controller = new Botkit({
    webhook_uri: '/api/messages',
    adapter: adapter,
    storage
});



// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
    console.log("\n==========================================\n\n Sabemi Bot is Running \n\n==========================================")

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    controller.interrupts("STOP", "message", async (bot, message) => {
        await bot.reply(message, "[STOP]+++Interação interrompida");
        await bot.cancelAllDialogs();
    });

    controller.interrupts("parar", "message", async (bot, message) => {
        await bot.cancelAllDialogs();
        await bot.beginDialog("pararMenu");
    });
    
    controller.interrupts("sol", "message", async (bot, message) => {
        await bot.cancelAllDialogs();
        await bot.beginDialog("solMenu");
    });

    controller.on("message", async (bot) => {  
        console.log("Início")      
        await bot.beginDialog("simulacao",{
        });
    }); 

});