<div align="center">

<img alt="logo" src="./assets/chibi.png" width="200px">

# Chibi (チビ)

#### とあるユニバーサル Scratch 拡張機能ローダーです。

</div>

---

Chibi は Tampermonkey/GreasyMonkey に対応するユーザースクリプトであり、「どのエディターでも拡張機能が使える」という仕様が搭載されています（理論的に）。

# ✨ 仕様

- [X] 標準 Scratch 拡張機能をロードできる
- [X] Unsandboxed 拡張機能をロードできる
- [X] どこでも Turbowarp 専用機能を使える (一部)
- [ ] 拡張機能をインストールしなくでもサードパーティー拡張機能を搭載したプロジェクトを起動できる
- [X] 直接的にエディターから拡張機能をロードできる

# 🌈 プラットフォーム

- [X] Scratch
- [X] CodingClip
- [X] Cocrea
- [X] Aerfaying
- [X] Co-Create World
- [X] XMW
- [X] CodeLab
- [X] 40code
- [X] TurboWarp
- [X] Xueersi

# 🔥 使い方

1. Tampermonkey / Greasymonkey をインストールします。
2. [リリースページ](https://github.com/SimonShiki/chibi/releases)を開き、バージョンを選択してインストールします。
3. 'ブロック定義'のカテゴリーで、'Open Frontend' が現れます。クリックすると拡張機能をサイドロードできます。（都合により、およそ５秒のラグがあります）

> うん…エディターによって、ボタンが正常に現れない場合もあります。その時は DevTools で拡張機能をロードできます。

1. 'Ctrl + Shift + J' (Windows) / 'Cmd + Opt + J' (MacOS) で DevTools を開きます。
2. コンソールで ``chibi.openFrontend()`` や ``chibi.loader.load([extensionURL], [load mode, like 'unsandboxed'])'``を実行します。
3. これで完成。

# 🥰 拡張機能の投稿

Chibi のダッシュボードには拡張機能のギャラリーがあります。どうぞ自由に好きな拡張機能を使ってください。

もし良かったら [moth](https://github.com/SimonShiki/moth) で自分の一番好きな拡張機能を投稿してください。

# ⚓ ライセンス

AGPL-3.0 です。詳しくは[こちら](./LICENSE)。
