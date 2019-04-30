const functions = require('firebase-functions');
const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');

const extensionId = encodeURIComponent(functions.config().clova.extension.id);

const colorcodes = { 黒:0, 茶:1, 赤:2, 橙:3, 黄:4, 緑:5, 青:6, 紫:7, 灰:8, 白:9 };

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
        if(intent === 'FindValueByColorcodeIntent'){
            const slots = responseHelper.getSlots();
            console.log(slots.colorcode);
            //デフォルトのスピーチ内容を記載 - 該当スロットがない場合をデフォルト設定
            let speech = {
                lang: 'ja',
                type: 'PlainText',
                value:  `登録されていない抵抗値です。`
            }
            if (slots.colorcode.length === 4) {
                const registorValue = (colorcodes[slots.colorcode[0]] * 10 + colorcodes[slots.colorcode[1]]) * 10 ** colorcodes[slots.colorcode[2]];
                console.log('Registor value:', registorValue);
                speech.value = `${slots.colorcode}の抵抗値は${registorValue}Ωです。`;
            }
            responseHelper.setSimpleSpeech(speech);
            responseHelper.setSimpleSpeech(speech, true);
        }
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