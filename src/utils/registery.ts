
import fs from "fs";
import path from "path";
import { SettClient, commandBase } from "../types";
import { log } from "./utils.js";
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = (path.dirname(__filename))

async function registerCommands(client: SettClient, ...dirs: string[]) {
    for (const dir of dirs) {
        const files = await fs.promises.readdir(path.join(__dirname, dir));
        for (let file of files) {
            const stat = await fs.promises.lstat(path.join(__dirname, dir, file));
            if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
            else {
                if (file.endsWith(".js")) {
                    try {
                        const cmdModule: commandBase = (await import(pathToFileURL(path.join(__dirname, dir, file)).href)).default;
                        const { name, aliases, category, execute } = cmdModule;
                        
                        if (!name) {
                            log("WARNING", "src/registry.ts", `The command '${path.join(__dirname, dir, file)}' doesn't have a name`);
                            continue;
                        }

                        if (!execute) {
                            log("WARNING", "src/registry.ts", `The command '${name}' doesn't have an execute function`
                            );
                            continue;
                        }

                        if (client.commands.has(name)) {
                            log("WARNING", "src/registry.ts", `The command name '${name}' has already been added.`);
                            continue;
                        }

                        client.commands.set(name, cmdModule);

                        if (aliases && aliases.length !== 0) {
                            aliases.forEach((alias) => {
                                if (client.commands.has(alias)) {
                                    log("WARNING", "src/registry.ts", `The command alias '${alias}' has already been added.`);
                                } else client.commands.set(alias, cmdModule);
                            });
                        }

                        if (category) {
                            let commands = client.categories.get(category.toLowerCase());
                            if (!commands) commands = [category];
                            commands.push(name);
                            client.categories.set(category.toLowerCase(), commands);
                        } else {
                            log("WARNING", "src/registry.ts", `The command '${name}' doesn't have a category, it will default to 'No category'.`);
                            let commands = client.categories.get("no category");
                            if (!commands) commands = ["No category"];
                            commands.push(name);
                            client.categories.set("no category", commands);
                        }

                    } catch (e) {
                        log("ERROR", "src/registry.ts", `Error loading commands: ${e.message}`);
                        console.log(e)
                    }
                }
            }
        }
    }
}

async function registerEvents(client: SettClient, dir: string) {
    const files = await fs.promises.readdir(path.join(__dirname, dir));
    for (let file of files) {
      const stat = await fs.promises.lstat(path.join(__dirname, dir, file));
      if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
      else {
        if (file.endsWith(".js")) {
          let eventName = file.substring(0, file.indexOf(".js"));
          try {
            let eventModule = (await import(path.join(pathToFileURL(path.join(__dirname, dir, file)).href))).default;
            client.on(eventName, eventModule.bind(null, client));
          } catch (e) {
            log(
              "ERROR",
              "src/registry.ts",
              `Error loading events: ${e.message}`
            );
          }
        }
      }
    }
  }
  
export { registerEvents, registerCommands };