import { Client, fetchExchange } from "@urql/svelte";

let appQL: Client;

function createClient(url: string) {
    return new Client({
        url,
        exchanges: [fetchExchange],
    });
}

const defaultEndpoint =
    import.meta.env.DEV
        ? "https://localhost:5000/graphql"
        : "/graphql";

appQL = createClient(defaultEndpoint);

export function setAppQLBaseUrl(url: string) {
    if (import.meta.env.VITE_TESTING === "true") {
        appQL = createClient(url + "/graphql");
    }
}

export default function getAppQL() {
    return appQL;
}
