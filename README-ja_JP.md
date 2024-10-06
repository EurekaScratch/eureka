<div align="center">

<img alt="logo" src="./assets/eureka.svg" width="200px">

# Eureka

#### とあるユニバーサル Scratch 拡張機能ローダーです。

</div>

---

Eureka は Tampermonkey/GreasyMonkey に対応するユーザースクリプトであり、「どのエディターでも拡張機能が使える」という仕様が搭載されています（理論的に）。

# ✨ 仕様

- [x] 標準 Scratch 拡張機能をロードできる
- [x] Unsandboxed 拡張機能をロードできる
- [x] どこでも Turbowarp 専用機能を使える (一部)
- [x] 拡張機能をインストールしなくでもサードパーティー拡張機能を搭載したプロジェクトを起動できる
- [x] 直接的にエディターから拡張機能をロードできる

# 🌈 プラットフォーム

- [x] Scratch
- [x] CodingClip
- [x] Cocrea
- [x] Aerfaying
- [x] Co-Create World
- [x] XMW
- [x] CodeLab
- [x] 40code
- [x] TurboWarp
- [x] Xueersi
- [x] Creaticode
- [x] Adacraft
- [x] PenguinMod
- [x] ElectraMod *
- [x] XPLab *

*\*: CI ビルドだけ使用できます*

# 🔥 使い方

1. Tampermonkey / Greasymonkey をインストールします。
2. [リリースページ](https://github.com/EurekaScratch/eureka-loader/releases)を開き、バージョンを選択してインストールします。
3. 'ブロック定義'のカテゴリーで、'Open Frontend' が現れます。クリックすると拡張機能をサイドロードできます。（都合により、およそ５秒のラグがあります）

> うん…エディターによって、ボタンが正常に現れない場合もあります。その時は DevTools で拡張機能をロードできます。

1. 'Ctrl + Shift + J' (Windows) / 'Cmd + Opt + J' (MacOS) で DevTools を開きます。
2. コンソールで ``eureka.openFrontend()`` や ``eureka.loader.load([extensionURL], [load mode, like 'unsandboxed'])'``を実行します。
3. これで完成。

# 🥰 拡張機能の投稿

Eureka のダッシュボードには拡張機能のギャラリーがあります。どうぞ自由に好きな拡張機能を使ってください。

もし良かったら [moth](https://github.com/EurekaScratch/moth) で自分の一番好きな拡張機能を投稿してください。

# ⚓ ライセンス

AGPL-3.0 です。詳しくは[こちら](./LICENSE)。
