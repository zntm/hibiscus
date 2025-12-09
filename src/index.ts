import { REST } from "@discordjs/rest";
import {
    ActivityType,
    Client,
    ClientUser,
    Collection,
    Events,
    GatewayIntentBits as Intents,
    Partials,
    SlashCommandBuilder,
} from "discord.js";
import { Routes } from "discord-api-types/v10";
import { readdirSync } from "fs";
import { join } from "path";
import { setInterval } from "node:timers";

import Utils from "./class/utils.ts";
import Model from "./class/mongoose.ts";

interface IClient extends Client {
    commands: Collection<string, any>;
    db: Record<string, Model>;
    user: ClientUser;
    utils: Utils;
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
        Intents.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
}) as IClient;

client.commands = new Collection();
client.db = {};
client.utils = new Utils();

const body: SlashCommandBuilder[] = [];

const loadFiles = async (type: string, func: any) => {
    console.log(`Loading files from: ${type}...`);

    const files = readdirSync(join(__dirname, `./${type}`)).filter((file) =>
        file.endsWith(".ts"),
    );

    await Promise.all(
        files.map(async (file) => {
            console.log(`Loading ${file}...`);

            const command = await import(`./${type}/${file}`);
            const name = file.slice(0, -3);

            return func(name, command?.default ?? command);
        }),
    );
};

const loadCommandsPush = (type: string) =>
    loadFiles(type, (name: string, command: any) => {
        client.commands.set(name, command);

        body.push(command.metadata.getInfo());
    });

const loadCommands = (type: string) =>
    loadFiles(type, (name: string, command: any) => client.commands.set);

const loadEvents = () =>
    loadFiles("events", (name: string, command: any) =>
        client.on(name, command),
    );

const loadSchemas = () =>
    loadFiles(
        "schema",
        (name: string, command: any) =>
            (client.db[name] = new Model(name, command)),
    );

const activities = ["Catharsis", "Leap of Faith", "Phantasia", "Ruins"];
let activityIndex = Math.floor(Math.random() * activities.length);

const updateActivity = (client: IClient): void => {
    client.user.setActivity({
        name: activities[activityIndex],
        type: ActivityType.Playing,
    });

    activityIndex = (activityIndex + 1) % activities.length;
};

client.on(Events.ClientReady, async () => {
    await Promise.all([
        loadCommandsPush("cmd"),
        loadCommandsPush("ctx"),
        loadCommands("cmd/modal"),
        loadEvents(),
        loadSchemas(),
    ]);

    console.log(client.db);

    console.log(`${client.user.username} is online!`);

    updateActivity(client);
    setInterval(updateActivity, 1_000 * 60 * 15, client);

    // NOTE: Toggle if commands need to be reloaded
    if (false) {
        await new REST({ version: "10" })
            .setToken(Bun.env?.DISCORD_TOKEN ?? "")
            .put(Routes.applicationCommands(client.user.id), { body })
            .catch(console.error);
    }
});

client.login(Bun.env?.DISCORD_TOKEN);

process
    .on("uncaughtException", console.error)
    .on("unhandledRejection", console.error);

export { client };
export type { IClient };
