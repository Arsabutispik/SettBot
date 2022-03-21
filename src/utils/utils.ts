const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
}

function log(type: "SUCCESS"|"ERROR"|"WARNING", path: string, text: string) {
    console.log(`\u001b[36;1m<bot-prefab>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`);
}
function randomRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { log, randomRange }
