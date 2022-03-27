const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
}
/**
 * 
 * @param type - Durum
 * @param path - Hatanın çıktığı dosya
 * @param text - Hata mesajı
 */
function log(type: "SUCCESS"|"ERROR"|"WARNING", path: string, text: string) {
    console.log(`\u001b[36;1m<bot-prefab>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`);
}

/**
 * 
 * @param min - Minimum sayı
 * @param max - Maximum sayı
 * @returns  Minimum ile Maximum arasında bir sayı
 */
function randomRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function msToTime(ms: number) {
    let day, hour, minute, seconds;
    seconds = Math.floor(ms / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return day ?
        (hour ?
            (`${day} gün ${hour} saat ${minute} dakika ${seconds}saniye`) :
            (minute ?
                (`${day} gün ${minute} dakika ${seconds} saniye`) :
                (`${day} gün ${seconds} saniye`))) :
        (hour ?
            (`${hour} saat ${minute} dakika ${seconds} saniye`) :
            (minute ?
                (`${minute} dakika ${seconds} saniye`) :
                (`${seconds} saniye`)))
}

export { log, randomRange, msToTime }
