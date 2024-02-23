"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.name = void 0;
const http_1 = __importDefault(require("http"));
//Mitpoppy（幻想开发） 
//嘤嘤嘤，写完时候基本可以正常使用了，如果以后有什么bug自己修罢，目前仅支持1.15版本RCN房间查询 
exports.name = 'rw';
function apply(ctx) {
    ctx.on('message', (session) => {
        const content = session.content;
        const regex = /[rR]\d+/g;
        const matches = content.match(regex);
        if (matches) {
            for (const match of matches) {
                const roomId = match.toUpperCase();
                const apiUrl = `http://api.der.kim:8080/api/get/rwrelayping?id=${roomId}`;
                http_1.default.get(apiUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const responseData = JSON.parse(data);
                            const result = responseData.Result;
                            if (result) {
                                const decodedResult = Buffer.from(result, 'base64').toString('utf8');
                                const decodedContent = JSON.parse(decodedResult);
                                let mapName = decodedContent['MapName'] || '未知地图';
                                // 按斜杠分割地图名并取最后一个元素
                                const mapParts = mapName.split('/');
                                mapName = mapParts[mapParts.length - 1];
                                const gameName = decodedContent['AutoGameName'] || '铁锈-未知版本QwQ';
                                const multiplier = decodedContent['Income'] || 1.0;
                                const noNukes = decodedContent['NoNukes'] || false;
                                const mist = decodedContent['Mist'] || '未知迷雾';
                                const initUnit = decodedContent['InitUnit'] || '未知单位';
                                const playerCount = `${(decodedContent['PlayerCount'] || 0) - 1}/10`;
                                const delay = `${decodedContent['PrPing'] || 0}/${decodedContent['ConnectPing'] || 0} ms`;
                                const mod = decodedContent['UnitData'] || 'Default';
                                const id = roomId;
                                const gameVersion = '1.15';
                                const replyMessage = `自动识别: ${gameName}\n地图名称: ${mapName}\n倍率: ${multiplier}\n禁核: ${noNukes}\n迷雾: ${mist}\n默认单位: ${initUnit}\n人数: ${playerCount}\n延迟/内部处理时间: ${delay}\n使用Mod: ${mod}\nID: ${id}\n游戏版本: ${gameVersion}`;
                                session.send(replyMessage);
                            }
                            else {
                                console.error('API response does not contain result data');
                            }
                        }
                        catch (error) {
                            console.error('Error parsing API response:', error);
                        }
                    });
                }).on('error', (error) => {
                    console.error('Error fetching API data:', error);
                });
            }
        }
    });
    ctx.on('message', (session) => {
        const content = session.content;
        if (content === 'rcnapi') {
            const apiUrl = 'http://api.der.kim:8080/api/get/rwrelayping?id=1';
            // Check if API is accessible
            http_1.default.get(apiUrl, (res) => {
                let apiStatus = res.statusCode === 200 ? 'API is accessible' : 'API is not accessible';
                session.send(`RCN API Status: ${apiStatus}`);
            }).on('error', () => {
                session.send('RCN API is not accessible');
            });
        }
    });
}
exports.apply = apply;
