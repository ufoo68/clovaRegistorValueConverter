# clovaRegistorValueConverter
Clovaスキル「抵抗値換算」のレポジトリです。サーバは[Firebase](https://console.firebase.google.com)を使ってます。

# Firebaseの環境構築方法
手順については[この記事](https://qiita.com/n0bisuke/items/909881c8866e3f2ca642)を参考にしてます。  
まずはFirebase CLIをインストールします。  
```npm install -g firebase-tools```  
`-g`を使ってグローバルにインストールします。場合によってはpermissionではじかれる可能性もあるので`sudo`が必要かも？  
次にログインします。  
```firebase login```  
ここら辺はターミナルに言われるまま操作すれば問題ないかと。次にプロジェクトを作成します。  
```firebase init functions```  
既存のプロジェクトを選択・新しくプロジェクトを作成する、の2択が選べます。このとき注意したいのが、無料枠ではLINE APIなどの外部のAPIが使えないのでBlazeなどにアップグレードさせる必要があります。  
次にFirebaseにデプロイします。  
```firebase deploy --only functions,hosting```