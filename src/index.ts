//Gerekli şeyleri aktar
import {Client, Collection} from 'discord.js';
import mongoose from 'mongoose';
// @ts-ignore
import config from './config.json' assert {type: 'json'};
import { SettClient } from './types';
import { registerCommands, registerEvents } from './utils/registery.js';
import { log } from './utils/utils.js';
import checkPunishments from './utils/checkPunishments.js';

const settBot = new Client({intents: 32767}) as SettClient

(async () => {
    //Koleksiyonları bota tanıt
    settBot.commands = new Collection();
    settBot.categories = new Collection();
    settBot.userInfoCache = new Collection();
    settBot.duelChannel = new Collection();
    settBot.duelInfo = new Collection();
    settBot.DBUser = (await import("./schemas/userSchema.js")).default;
    //Komutları ve olayları yükle
    await registerEvents(settBot, "../events");
    await registerCommands(settBot, "../commands");
    //Veri tabanına bağlan
    try {
        await mongoose.connect(config.MONGODB_URI);
        log("SUCCESS", "src/index.ts", "Connected to the database.");
    } catch (e) {
        log("ERROR", "src/index.ts", `Error connecting to the database: ${e.message}`);
        process.exit(1);
    }
    //Botu aktif et.
    try {
        await settBot.login(config.TOKEN);
        log(
        "SUCCESS",
        "src/index.ts",
        `Logged in as ${settBot.user!.tag}`
        );
    } catch (e) {
        log("ERROR", "src/index.ts", `Bağlanırken Hata: ${e.message}`);
    }
    await checkPunishments(settBot)
    log("SUCCESS","src/index.ts","Bütün komutlar, kategoriler, olaylar ve koleksiyonlar bota tanıtıldı. Veri tabanı bağlandı");
})();