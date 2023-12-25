const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const get = require('axios');

require('dotenv').config({ path: './.env' });
const logger = require('./logger');

const client = new Client({
    intents : [
        GatewayIntentBits.Guilds
    ]
})

let isOffline = false;

client.on('ready', () => {
    logger.info('Avax Tracker Running...')
    setInterval(getData, 10 * 2000)
})

const getData = async () => {
    try {
        const resAvax = await get(`https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api?module=stats&action=ethprice&apikey=${process.env.ROUTESCAN_PRIV}`);
        const avaxPrice = resAvax.data;

        if (isOffline) {
            logger.info('Bot is back online.');
            isOffline = false;
        }

        client.user.setActivity(`AVAX $${avaxPrice.result.ethusd.toLocaleString()}`, { type: ActivityType.Watching });
    } catch (err) {
        if (err.code == 'ECONNRESET') {
            logger.info('ECONNRESET');
            logger.error('Connection was reset - ECONNRESET error.');
        } else if (err.code === 'ENOTFOUND') {
            if (!isOffline) {
                logger.info('ENOTFOUND');
                logger.error('Cannot resolve the API - ENOTFOUND error.');
                isOffline = true;
            }
            // Optionally, you can use setTimeout here to wait before retrying
        } else {
            logger.error(err);
        }
    }
}

client.login(process.env.DISCORD_TOKEN)