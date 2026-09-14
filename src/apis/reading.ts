import type { IncomingMessage, ServerResponse } from "http";


class ReadingApi {

    public getReadings(request: IncomingMessage, response: ServerResponse) {

        response.writeHead(200, {
            'content-type': 'application/json'
        });

        response.end(
            JSON.stringify({
                message: 'Readings API is working'
            })
        );
    }
}

export default ReadingApi;