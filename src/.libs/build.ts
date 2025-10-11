import { readdirSync } from 'fs'
import { join } from 'path'

const findEntrypoints = (src: string, data: string[] = []) => {
    try
    {
        const directories = readdirSync(src);

        directories.forEach((file) => {
            if (/([a-z]+\.[a-z]+)$/g.test(`${src}/${file}`))
            {
                data.push(`${src}/${file}`);
            }
            else if (!file.startsWith('.'))
            {
                findEntrypoints(`${src}/${file}`, data);
            }
        });
    }
    catch
    {
    }

    return data;
}

const entrypoints: string[] = findEntrypoints(join(__dirname, '../'));

Bun.build({
    entrypoints,
    outdir: './build',
    target: 'bun',
    minify: {
        whitespace: true,
        identifiers: false,
        syntax: true,
        keepNames: false
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
                        .replaceAll('.json', '.js');
                    
                    // NOTE: Hacky fix for __dirname.
                    if (contents.includes('__dirname'))
                    {
                        contents = 'var b09fd1="' + args.path.split('\\').slice(0, -1).join('\\\\').replaceAll('\\\\hibiscus', '\\\\hibiscus\\\\build') + '";' + contents.replaceAll('__dirname', 'b09fd1');
                    }

                    return {
                        contents,
                        loader: 'ts'
                    }
                });
            }
        }
    ]
});