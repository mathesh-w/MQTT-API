import Router from "../../router/router.js";
import ReadingApi from "./reading.js";

class ReadingRoutes {

    constructor(
        private readonly router: Router,
        private readonly readingApi: ReadingApi,
    )
    {}

    public configure(): void {

        this.router.get(
            '/reading-list', 
            this.readingApi.getReadings.bind(this.readingApi)
        );
        this.router.post(
            '/reading-list', 
            this.readingApi.getReadings.bind(this.readingApi)
        );
        this.router.get(
            '/stats', 
            this.readingApi.getStats.bind(this.readingApi)
        );
        this.router.post(
            '/delete-reading', 
            this.readingApi.deleteReading.bind(this.readingApi)
        );
        this.router.post(
            '/create-reading', 
            this.readingApi.createReading.bind(this.readingApi)
        );
        this.router.post(
            '/update-reading', 
            this.readingApi.updateReading.bind(this.readingApi)
        );
        this.router.post(
            '/get-latest-reading', 
            this.readingApi.getLatestReading.bind(this.readingApi)
        );


    }
}

export default ReadingRoutes;