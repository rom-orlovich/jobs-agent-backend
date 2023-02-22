"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoDB = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const mongoClient_1 = require("../../lib/mongoClient");
const controllers_1 = require("./controllers");
const cors_1 = __importDefault(require("cors"));
const middleware_1 = require("./middleware");
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_os_1 = __importDefault(require("node:os"));
const totalCPUs = node_os_1.default.cpus().length;
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
exports.mongoDB = new mongoClient_1.MongoDBClient();
const expressServer = () => {
    app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL, credentials: true }));
    app.get('/api/jobs-agent/start/:userID', middleware_1.validateBeforeScanner, controllers_1.startScanner);
    app.get('/api/jobs-agent/download/:userID', middleware_1.validateBeforeScanner, controllers_1.downloadResults);
    console.log('start');
    app.listen(5000, () => {
        console.log(`server listen on port ${PORT}`);
    });
};
const startClusters = () => __awaiter(void 0, void 0, void 0, function* () {
    if (node_cluster_1.default.isPrimary) {
        console.log(`Number of CPUs is ${totalCPUs}`);
        console.log(`Master ${process.pid} is running`);
        try {
            yield exports.mongoDB.connect();
            // Fork workers.
            for (let i = 0; i < totalCPUs; i++) {
                node_cluster_1.default.fork();
            }
            node_cluster_1.default.on('exit', (worker) => {
                console.log(`worker ${worker.process.pid} died`);
                console.log("Let's fork another worker!");
                node_cluster_1.default.fork();
            });
        }
        catch (error) {
            yield exports.mongoDB.close();
        }
    }
    else {
        expressServer();
    }
});
startClusters();
//# sourceMappingURL=index.js.map