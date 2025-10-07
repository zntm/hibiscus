import { REST } from '@discordjs/rest'
import { ActivityType, Client, ClientUser, Collection, Events, GatewayIntentBits as Intents, Partials, SlashCommandBuilder } from 'discord.js'
import { Routes } from 'discord-api-types/v10'
import { readdirSync } from 'fs'
import { join } from 'path'

import Utils from './class/utils.ts'
import Model from './class/mongoose.ts'

interface IClient extends Client {
    commands: Map<string, any>;
    db: {
        [key: string]: Model
    },
    utils: Utils;
    user: ClientUser;
}

const client: IClient = new Client({
    intents: [
        Intents.GuildExpressions,
        Intents.Guilds,
        Intents.GuildInvites,
        Intents.GuildMembers,
        Intents.GuildMessages,
        Intents.GuildMessageReactions,
        Intents.GuildPresences,
        Intents.GuildWebhooks,
        Intents.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
}) as IClient;

client.commands = new Collection();
client.db = {}
client.utils = new Utils();

readdirSync(join(__dirname, './schema'))
    .filter((file: string) => file.endsWith('.ts'))
    .forEach(async (file: string) => {
        const schema = await import(`./schema/${file}`);
        const name = file.slice(0, -3);
    	
        client.db[name] = new Model(name, schema.default);
    });

const body: SlashCommandBuilder[] = [];

const init = async (type: string, push: boolean): Promise<void> => {
    readdirSync(join(__dirname, `./${type}`))
        .filter((file: string) => file.endsWith('.ts'))
        .forEach(async (file: string) => {
            console.log(`${type} * Loading ${file}...`);

            const command = await import(`./${type}/${file}`);
        	
            if (push)
            {
                const info = command.metadata.getInfo();
                
                client.commands.set(info.name, command);
                body.push(info);
            }
        	else
            {
                client.commands.set(file.slice(0, -3), command);
            }
            
            console.log(`${type} * ${file} loaded!`);
        });
}

await init('cmd', true);
await init('ctx', true);
await init('cmd/modal', false);

const activities = [
    'Catharsis',
    'Leap of Faith',
    'Phantasia',
    'Ruins'
];

let activityIndex = Math.floor(client.utils.getUptimeDate().getTime()) % activities.length;

const updateActivity = (client: any) => {
    client.user.setActivity({
        name: activities[activityIndex],
        type: ActivityType.Playing
    });
    
    activityIndex = (activityIndex + 1) % activities.length;
}

client.on(Events.ClientReady, async () => {
    console.log(`${client.user.username} is online!`);
    
    updateActivity(client);
    setInterval(updateActivity, 1_000 * 60 * 15, client);
    
    // NOTE: Toggle if commands need to be reloaded
    if (false)
    {
        await new REST({ version: '10' })
            .setToken(Bun.env?.DISCORD_TOKEN ?? '')
            .put(Routes.applicationCommands(client.user.id), { body })
            .catch(console.error);
    }
});

readdirSync(join(__dirname, './events'))
    .filter((file: string) => file.endsWith('.ts'))
    .forEach(async (file: string) => {
        const { default: event } = await import(`./events/${file}`);

        client.on(file.slice(0, -3), event);
    });

client.login(Bun.env?.DISCORD_TOKEN);

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

export const run = () => {
    
}

export { client };
export type { IClient };