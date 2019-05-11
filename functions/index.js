const functions = require('firebase-functions');
const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');

const extensionId = functions.config().clova.extension.id;

const howToMemorize = {
    橙 : "橙はミカン",
    灰 : "ハイヤー",
    白 : "四苦八苦",
    紫 : "紫しち部",
    緑 : "さつきみどり",
    茶 : "茶を一杯",
    赤 : "赤いニンジン",
    青 : "青虫",
    黄 : "四季の色",
    黒 : "黒い礼服"
};

const colorcodes = { 
    黒:'0', 
    茶:'1', 
    赤:'2', 
    橙:'3', 
    黄:'4', 
    緑:'5', 
    青:'6', 
    紫:'7', 
    灰:'8', 
    白:'9' 
};

const clovaSkillHandler = clova.Client
    .configureSkill()

    //起動時に喋る
    .onLaunchRequest(responseHelper => {
        responseHelper.setSimpleSpeech({
            lang: 'ja',
            type: 'PlainText',
            value: '抵抗器のカラーコード、またはカラーコードに変換したい抵抗値を教えてください。',
        });
    })

    //ユーザーからの発話が来たら反応する箇所
    .onIntentRequest(async responseHelper => {
        const intent = responseHelper.getIntentName();
        const sessionId = responseHelper.getSessionId();
        const slots = responseHelper.getSlots();

        console.log('Intent:' + intent);

        let speech = {
            lang: 'ja',
            type: 'PlainText',
            value:  `まだ対応していないカラーコード、または抵抗値です。`
        }

        switch(intent) {
        // カラーコード -> 抵抗値の処理
        case 'FindValueByColorcodeIntent':
            const colorcode = String(slots.colorcode);
            
            // 通常の４つのカラーコードの並びの抵抗
            if (colorcode.length === 4) {
                const firstValue = colorcodes[colorcode[0]] //1番目のカラーコード
                const secondValue = colorcodes[colorcode[1]] //2番目のカラーコード
                const thirdValue = colorcodes[colorcode[2]] //3番目のカラーコード
                const registorValue = thirdValue => { 
                    switch(thirdValue) {
                        case '0':
                            return `${firstValue}${secondValue}`;
                        case '1':
                            return `${firstValue}${secondValue}0`;
                        case '2':
                            if (secondValue === '0') {
                                return `${firstValue}キロ`;
                            } else {
                                return `${firstValue}.${secondValue}キロ`;
                            }                       
                        case '3':
                            return `${firstValue}${secondValue}キロ`;
                        case '4':
                            return `${firstValue}${secondValue}0キロ`;
                        default:
                            return '対応していない抵抗器の値の';
                    }
                }
                console.log('Registor value:', registorValue(thirdValue));
                speech.value = `${colorcode}の抵抗値は${registorValue(thirdValue)}Ωです。`;
            }
            break;

        // 抵抗値 -> カラーコードの処理
        case 'FindColorcodeByValueIntent':
            const registorValue = String(slots.number);
            console.log('slots:', registorValue)
            // 半角数字のとき(漢数字は自動的に半角英数字に変換される)
            if (registorValue !== 'undefined' && registorValue.length >= 2) {
                const firstColor = Object.keys(colorcodes).filter(key => { 
                    return colorcodes[key] === registorValue.slice(0, 1)
                });
                const secondColor = Object.keys(colorcodes).filter(key => { 
                    return colorcodes[key] === registorValue.slice(1, 2)
                });
                const thirdColor = Object.keys(colorcodes).filter(key => { 
                    return colorcodes[key] === String(registorValue.length - 2)
                });
                const colorcode = `${firstColor}${secondColor}${thirdColor}`;
                speech.value = `${registorValue}Ωのカラーコードは${colorcode}金です。`
            }
            break;

        // カラーコードの覚え方
        case 'HowToMemorizeColorcode':
            const mnemonic = howToMemorize[String(slots.color)];
            speech.value = `${mnemonic}。と覚えましょう。`
            break;
        
        //Intentをうまく受け取れなかったとき
        default:
            speech.value = `もう一度お願いします。`;
            break;
        }
        responseHelper.setSimpleSpeech(speech);
        responseHelper.setSimpleSpeech(
            clova.SpeechBuilder.createSpeechText('抵抗器のカラーコード、またはカラーコードに変換したい抵抗値を教えてください。'), true
        );
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