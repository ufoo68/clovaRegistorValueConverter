# clovaRegistorValueConverter
Clovaスキル「抵抗値換算」のレポジトリです。サーバは[Firebase](https://console.firebase.google.com)を使ってます。  

# 「抵抗値換算」について
電子工作に使う抵抗素子には「カラーコード」と呼ばれるものが表示されています。このカラーコードの並びから抵抗値を読み取ることができますが、電子工作に慣れていない人には「カラーコード -> 抵抗値」への変換がすぐには難しいです。そこでこのスキルを使ってClovaの前でカラーコードの色の並びを読み上げて、それを抵抗値に変換したものをClovaに読んでもらうものを作りました。  
このスキルでは精密抵抗器を無視した4つのカラーコードの並びで、[このサイト](http://part.freelab.jp/s_regi_list.html)の「よく使われる抵抗の一覧表」の抵抗素子に対応します（ArduinoでLEDやセンサを使う場合は1kか10kの数値のものしか基本は使わないかと）。カスタムスロットとして同一レポジトリの`colorCodeValue.tsv`を用いています。  

# Firebaseの環境構築方法
## 初期設定
手順については[この記事](https://qiita.com/n0bisuke/items/909881c8866e3f2ca642)を参考にしてます。  
まずはFirebase CLIをインストールします。  
```npm install -g firebase-tools```  
`-g`を使ってグローバルにインストールします。場合によってはpermissionではじかれる可能性もあるので`sudo`が必要かも？  
次にログインします。  
```firebase login```  
ここら辺はターミナルに言われるまま操作すれば問題ないかと。次にプロジェクトを作成します。  
```firebase init functions```  
既存のプロジェクトを選択・新しくプロジェクトを作成する、の2択が選べます。  
次にFirebaseにデプロイします。  
```firebase deploy --only functions,hosting```  

  
## その他の設定
環境変数は以下のコマンドで設定可能です。  
```firebase functions:config:set clova.extension.id="your extension id"```  
環境変数の確認は以下のコマンドを用います。  
```firebase functions:config:get```  
コード上で用いたい場合は、以下のようにして呼び出します。  

```JavaScript
const extensionId = encodeURIComponent(functions.config().clova.extension.id);
```  

また、`firebase.json`は以下のように設定しました。  

```JavaScript
{
    "hosting": {
        "public": "./",
        "rewrites": [{
            "source": "/clova",
            "function": "clova"
        }],
        "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
        ]
    }
}
```

# Clovaの開発について
expressを用いたスキルの開発は[このサイト](https://dotstud.io/blog/clova-cek-nodejs-tutorial/#node-js%E3%81%AE%E7%92%B0%E5%A2%83%E6%BA%96%E5%82%99)を参照して行いました。  
`functions/`上で以下のコマンドを用いて必要なpackageをインストールします。  
```npm install --save https://github.com/TanakaMidnight/clova-cek-sdk-nodejs express body-parser```  
Clovaの公式SDKを用いない理由は[この記事](https://blog.tanakamidnight.com/2018/09/firebase-clova-sdk-node8/)を参照してください。  

## カラーコードから抵抗値への変換
まず連想配列を用意しました。色を`key`に対応する数値を`value`に設定してます。  
```JavaScript
const colorcodes = { 黒:'0', 茶:'1', 赤:'2', 橙:'3', 黄:'4', 緑:'5', 青:'6', 紫:'7', 灰:'8', 白:'9' };
```  
抵抗値の計算は以下の式で求めます

```js
const registorValue = (1番目のカラーコード * 10 + 2番目のカラーコード) * 10 ** 3番目のカラーコード;
``` 

しかしこの抵抗値を言葉としてアウトプットさせるときは「キロ」などの読み変換させるほうが自然になります。  
そこで`registorValue`への代入式を以下のように拡張させました。

```js
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
                return `${firstValue}点${secondValue}キロ`;
            }                       
        case '3':
            return `${firstValue}${secondValue}キロ`;
        case '4':
            return `${firstValue}${secondValue}0キロ`;
        default:
            return '？';
    }
}
```
`firstValue, secondValue, thirdValue`はそれぞれ1番目～3番目のカラーコードに対しています。`case 5: ~ case 9:`の実装をしていませんが、元々スロットを用意していないので省略しました。  

## 抵抗値 -> カラーコードへの変換
半角の数字スロットを受け取ったときに、その各桁の数値に対応する色のkeyを取得していくような処理を以下のように実装しました。 

```js
const registorValue  = String(slots.number);
if (typeof Number(registorValue) === 'number' && registorValue.length >= 2) {
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
```

抵抗値を2桁以上と制限をかけていますが、通常は3桁以上の抵抗値をよく使うので実用上は問題ないと思います。今回は誤差の値は考慮しないので4番目のカラーコードをデフォルトで金にしました。  

##  カラーコードの覚え方
以下のような連想配列を用意しました。DataBaseを使おうと思いましたが、使うほどの内容ではないので~~逃げました~~使わないという判断をしました。  
```js
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
```

覚え方は[このサイト](https://www.jarl.org/Japanese/7_Technical/lib1/teikou.htm)と自分が過去に使った覚え方を参考にしました。