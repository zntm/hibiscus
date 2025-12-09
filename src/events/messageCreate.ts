import { readdirSync } from "fs";
import { join } from "path";

const commands: any = readdirSync(join(__dirname, "../message"))
    .filter((i: string) => i.endsWith(".ts"))
    .map((file: string) => import.meta.require(`../message/${file}`));

export default (message: any) => {
    const channelId = message.channel.id;
    const userId = message.author.id;

    for (const { run, metadata } of commands) {
        if (metadata.hasUser(userId) && metadata.hasChannel(channelId)) {
            run(message, message.client, message.content.split(" "));

            return;
        }
    }
};
