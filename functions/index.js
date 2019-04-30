const functions = require('firebase-functions');
const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');

const extensionId = encodeURIComponent(functions.config().clova.extension.id);

const clovaSkillHandler = clova.Client
    .configureSkill()

    //起動時に喋る
    .onLaunchRequest(responseHelper => {
        responseHelper.setSimpleSpeech({
            lang: 'ja',
            type: 'PlainText',
            value: '抵抗器のカラーコードを教えてください。',
        });
    })

    //ユーザーからの発話が来たら反応する箇所
    .onIntentRequest(async responseHelper => {
        const intent = responseHelper.getIntentName();
        const sessionId = responseHelper.getSessionId();

        console.log('Intent:' + intent);
    })

    //終了時
    .onSessionEndedRequest(responseHelper => {
        const sessionId = responseHelper.getSessionId();
    })
    .handle();


const app = new express();

const clovaMiddleware = clova.Middleware({applicationId: extensionId});
app.post('/clova', clovaMiddleware, clovaSkillHandler);

exports.clova = functions.https.onRequest(app);