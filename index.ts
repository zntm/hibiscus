import { readdirSync } from 'fs'

const entrypoints: string[] = [];
const recursiveDirectory = (src: string) => {
    try
    {
        readdirSync(src).forEach((file) => {
            if (/([a-z]+\.[a-z]+)$/g.test(`${src}/${file}`))
            {
                entrypoints.push(`${src}/${file}`);
            }
            else
            {
                recursiveDirectory(`${src}/${file}`);
            }
        });
    }
    catch
    {
        return;
    }
}

recursiveDirectory('./src');

Bun.build({
    entrypoints,
    outdir: './build',
    target: 'bun',
    minify: {
        whitespace: false,
        identifiers: false,
        syntax: true,
        keepNames: true
    },
    // splitting: true,
    external: [ '*' ],
    naming: './[dir]/[name].[ext]',
    drop: [ 'console' ],
    plugins: [
        {
            name: 'ts-to-js-replacer',
            setup: (build) => {
                build.onLoad({ filter: /\.ts$/ }, async (args) => {
                    let contents = await Bun.file(args.path).text();

                    contents = contents
                        .replaceAll('.ts', '.js')
                        .replaceAll('.json', '.js')
                        // .replace(/\/[a-z]+.js/g, '.json');
                    
                    if (contents.includes('__dirname'))
                    {
                        // NOTE: Hacky fix for __dirname.
                        contents = 'var b09fd1="' + args.path.split('\\').slice(0, -1).join('\\\\').replaceAll('\\\\hibiscus', '\\\\hibiscus\\\\build') + '";' + contents.replaceAll('__dirname', 'b09fd1');

                        console.log(contents)
                    }

                    return {
                        contents,
                        loader: 'ts'
                    }
                });
            }
        }
    ],
    define: {
        // __dirname: JSON.stringify(import.meta.dir)
    }
});