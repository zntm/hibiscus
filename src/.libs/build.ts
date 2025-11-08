import { readdirSync } from "fs";
import { join } from "path";

const findEntrypoints = (src: string, data: string[] = []) => {
    try {
        const directories = readdirSync(src);

        directories.forEach((file) => {
            if (/([a-z]+\.[a-z]+)/g.test(`${src}/${file}`)) {
                data.push(`${src}/${file}`);
            } else if (!file.startsWith(".")) {
                findEntrypoints(`${src}/${file}`, data);
            }
        });
    } catch {}

    return data;
};

const entrypoints: string[] = findEntrypoints(join(__dirname, "../"));

Bun.build({
    entrypoints,
    outdir: "./build",
    target: "bun",
    format: "esm",
    minify: {
        whitespace: true,
        identifiers: false,
        syntax: true,
        keepNames: true,
    },
    naming: {
        entry: "./[dir]/[name].[ext]",
        chunk: "./[dir]/[name].[ext]",
        asset: "./[dir]/[name].[ext]",
    },
    external: ["*"],
    drop: ["console"],
    plugins: [
        {
            name: "replace ts & json with js",
            setup: (build) => {
                build.onLoad({ filter: /\.ts$/ }, async (args) => {
                    let contents = await Bun.file(args.path).text();

                    ["json", "ts"].forEach((ext) => {
                        contents
                            .match(new RegExp(`\\.(${ext})\\"`, "g"))
                            // ?.filter((path) => !path.includes("resources"))
                            ?.forEach((i) => {
                                contents = contents.replace(i, '.js"');
                            });
                    });

                    contents =
                        "const __dirname = import.meta.dirname;\n" + contents;

                    return {
                        contents,
                        loader: "ts",
                    };
                });
            },
        },
    ],
});
