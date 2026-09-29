import type { IncomingMessage } from "http";

class Input {

    constructor(private readonly req: IncomingMessage) {}

    public get() {

        const query = new URL(
            this.req.url ?? '',
            `http://${this.req.headers.host}`
        )

        return query;
    }

    public post(maxBytes: number = 1_000_000 ): Promise<string> {

        return new Promise((resolve, reject) => {
            let body = '';
            let size = 0;

            this.req.on('data', (chunk: Buffer) => {
                size += chunk.length;

                if (size > maxBytes) {
                    reject(new Error('Payload too large'));
                    this.req.destroy();
                    return;
                }

                body += chunk.toString();
            });

            this.req.on('end', () => resolve(body));
            this.req.on('error', reject)
            
        })
        
    }
}

export default Input;