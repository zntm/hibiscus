import { serve } from 'bun'

const server = serve({
    port: Math.floor(Math.random() * (65535 - 1024) + 1024),
    routes: {
        '/': () => new Response('Hello World!')
    }
});

console.log(`Listening on http://localhost:${server.port}!`);

import './src/app.ts';