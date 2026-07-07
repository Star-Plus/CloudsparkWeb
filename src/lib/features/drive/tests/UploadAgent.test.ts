import axios from "axios";
import test, { describe, it } from "node:test";
import UploadAgent from "../agents/UploadAgent";

const MOCK_SERVER = "https://f0265ccb-297f-4e7d-8f95-d2dc48f6d044.mock.pstmn.io";

describe("UploadAgent", () => {

    it('Check available repo', async ()=> {
        const agent = new UploadAgent(axios.create({baseURL: MOCK_SERVER}), `${MOCK_SERVER}/ws`);
    })
    
});