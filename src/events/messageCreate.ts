import Discord from "discord.js";
import { log } from "../utils/utils.js";
import { SettClient } from "../types";
import allowed from '../allowedURIs.js';

const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async (client: SettClient, message: Discord.Message) => {
    try {
        if (message.author.bot || message.channel.type === "DM" || message.webhookId) { 
            return;
        }
        if(urlRegex.test(escapeRegex(message.content))){
            for(const urls of urlRegex.exec(escapeRegex(message.content))!.input.split(/  | /ig)){
                if(allowed.includes(urls)){
                    continue
                } else {
                    message.reply("Link bulundu")
                }
            }
        }
        const prefixRegex = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex("s!")})\\s*`);
        if (!prefixRegex.test(message.content)) return;

        //@ts-ignore
        const [, matchedPrefix] = message.content.match(prefixRegex);
        let msgargs = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        let cmdName = msgargs.shift()!.toLowerCase();

        if (message.mentions.has(client.user!) && !cmdName){
            message.channel.send(`Prefix'im \`s!\` veya ${client.user}\nBütün komutlarımı görmek için \`s!yardım\` veya \`${client.user!.tag} yardım\` kullanabilirsiniz.`);
            return;
        }
        const command = client.commands.get(cmdName) 

        if (!command) return;
        
        command.execute({ client: client, message: message, args: msgargs});
    } catch (e) {
        log("ERROR", "src/eventHandlers/message.js", e.message);
    }
};