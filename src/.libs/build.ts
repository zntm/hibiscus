import { readdirSync } from "fs";
import { join } from "path";

const findEntrypoints = (src: string, data: string[] = []) => {
    const directories = readdirSync(src);

    for (const file of directories) {
        const filePath = `${src}/${file}`;

        if (/([a-z]+\.[a-z]+)/g.test(filePath)) {
            data.push(filePath);
        } else if (!file.startsWith(".")) {
            findEntrypoints(`${src}/${file}`, data);
        }
    }

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
        identifiers: true,
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

                    for (const ext of ["json", "ts"]) {
                        const regex = new RegExp(`\\.(${ext})\\"`, "g");

                        const matches = contents.match(regex);

                        if (matches) {
                            for (const match of matches) {
                                contents = contents.replace(match, '.js"');
                            }
                        }
                    }

                    if (contents.includes("__dirname")) {
                        contents =
                            "const __dirname = import.meta.dirname;\n" +
                            contents;
                    }

                    return {
                        contents,
                        loader: "ts",
                    };
                });
            },
        },
    ],
});
