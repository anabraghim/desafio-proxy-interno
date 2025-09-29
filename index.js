const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Singleton na cache e na fila
class ProxyStorage {
    constructor() {
        if (ProxyStorage.instance) return ProxyStorage.instance;

        this.queue = [];
        this.cache = {};

        ProxyStorage.instance = this;
    }

    getQueue() {
        return this.queue;
    }

    getCache() {
        return this.cache;
    }
}

const storage = new ProxyStorage();

// Command pra Requisição
class ProxyCommand {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    async execute() {
        const key = JSON.stringify({ query: this.req.query, clientId: this.req.header("client-id") });

        // Verifica cache
        const cache = storage.getCache();
        if (cache[key] && cache[key].expires > Date.now()) {
            return this.res.status(200).json(cache[key].data);
        }

        try {
            const response = await axios.get("https://score.hsborges.dev/api/score", {
                params: this.req.query,
                headers: { "client-id": this.req.header("client-id") }
            });

            // Salva no cache com TTL 5s
            cache[key] = {
                data: response.data,
                expires: Date.now() + 5000
            };

            this.res.status(200).json(response.data);
        } catch (err) {
            this.res.status(500).json({ error: "Erro ao acessar servidor" });
        }
    }
}

const MAX_QUEUE_SIZE = 50;
let isProcessing = false;

function schedule() {
    const queue = storage.getQueue();
    if (queue.length === 0) {
        isProcessing = false;
        return;
    }

    const command = queue.shift();
    command.execute();

    setTimeout(schedule, 1000); // 1 req/s
}

// Endpoint do Proxyy
app.get("/proxy/score", (req, res) => {
    const queue = storage.getQueue();
    if (queue.length >= MAX_QUEUE_SIZE) {
        return res.status(429).json({ error: "Fila cheia, tente novamente mais tarde" });
    }

    const command = new ProxyCommand(req, res);
    queue.push(command);

    if (!isProcessing) {
        isProcessing = true;
        schedule();
    }
});

app.listen(PORT, () => console.log(`Proxy rodando na porta ${PORT}`));