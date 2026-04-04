import { readdirSync } from "fs";
import { join } from "path";
import { TerminalMetadata } from "../class/metadata";
import { Message } from "discord.js";

const commands: {
    run: Function;
    metadata: TerminalMetadata;
}[] = readdirSync(join(__dirname, "../message"))
    .filter((i: string) => i.endsWith(".ts"))
    .map((file: string) => import.meta.require(`../message/${file}`));

export default (message: Message) => {
    const channelId = message.channel.id;
    const userId = message.author.id;

    for (const { run, metadata } of commands) {
        if (metadata.hasUser(userId) && metadata.hasChannel(channelId)) {
            run(message, message.client);

            return;
        }
    }
};
