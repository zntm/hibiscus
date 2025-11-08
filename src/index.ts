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

const loadCommands = async (type: string, push: boolean): Promise<void> => {
    const files = readdirSync(join(__dirname, `./${type}`)).filter((file) =>
        file.endsWith(".ts"),
    );

    for (const file of files) {
        const command = await import(`./${type}/${file}`);
        const name = file.slice(0, -3);

        client.commands.set(name, command);

        if (push) {
            const info = command.metadata.getInfo();
            body.push(info);
        }
    }
};

const loadEvents = async (): Promise<void> => {
    const files = readdirSync(join(__dirname, "./events")).filter((file) =>
        file.endsWith(".ts"),
    );

    for (const file of files) {
        const { default: event } = await import(`./events/${file}`);
        const eventName = file.slice(0, -3);

        client.on(eventName, event);
    }
};

const loadSchemas = async (): Promise<void> => {
    const files = readdirSync(join(__dirname, "./schema")).filter((file) =>
        file.endsWith(".ts"),
    );

    for (const file of files) {
        const schema = await import(`./schema/${file}`);
        const name = file.slice(0, -3);

        client.db[name] = new Model(name, schema.default);
    }
};

const activities = ["Catharsis", "Leap of Faith", "Phantasia", "Ruins"];

let activityIndex =
    Math.floor(client.utils.getUptimeDate().getTime()) % activities.length;

const updateActivity = (client: IClient): void => {
    client.user.setActivity({
        name: activities[activityIndex],
        type: ActivityType.Playing,
    });

    activityIndex = (activityIndex + 1) % activities.length;
};

client.on(Events.ClientReady, async () => {
    console.log("LOADING");

    await Promise.all([
        loadCommands("cmd", true),
        loadCommands("ctx", true),
        loadCommands("cmd/modal", false),
        loadEvents(),
        loadSchemas(),
    ]);

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

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

export { client };
export type { IClient };
