import { readdirSync } from "fs";
import { join } from "path";

const commands: any = readdirSync(join(__dirname, "../message"))
    .filter((i: string) => i.endsWith(".ts"))
    .map((file: string) => import.meta.require(`../message/${file}`));

export default (message: any) => {
    const channelId = message.channel.id;
    const userId = message.author.id;

    for (const { run, info } of commands) {
        if (info.hasUser(userId) && info.hasChannel(channelId)) {
            run(message, message.client);

            return;
        }
    }
};
