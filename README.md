# clovaRegistorValueConverter
Clovaスキル「抵抗値換算」のレポジトリです。サーバは[Firebase](https://console.firebase.google.com)を使ってます。

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

# 抵抗値換算について
電子工作に使う抵抗素子には「カラーコード」と呼ばれるものが表示されています。このカラーコードの並びから抵抗値を読み取ることができますが、電子工作に慣れていない人には「カラーコード -> 抵抗値」への変換がすぐには難しいです。そこでこのスキルを使ってClovaの前でカラーコードの色の並びを読み上げて、それを抵抗値に変換したものをClovaに読んでもらうものを作りました。  
このスキルでは精密抵抗器を無視した4つのカラーコードの並びで、[このサイト](http://part.freelab.jp/s_regi_list.html)の「よく使われる抵抗の一覧表」の抵抗素子に対応します（ArduinoでLEDやセンサを使う場合は1kか10kの数値のものしか基本は使わないかと）。カスタムスロットとして同一レポジトリの`colorCodeValue.tsv`を用いています。  


# Clovaの開発について
[このサイト](https://dotstud.io/blog/clova-cek-nodejs-tutorial/#node-js%E3%81%AE%E7%92%B0%E5%A2%83%E6%BA%96%E5%82%99)を参照しています。  
`functions/`上で以下のコマンドを用いて必要なpackageをインストールします。  
```npm install --save https://github.com/TanakaMidnight/clova-cek-sdk-nodejs express body-parser```  
Clovaの公式SDKを用いない理由は[この記事](https://blog.tanakamidnight.com/2018/09/firebase-clova-sdk-node8/)を参照してください。  