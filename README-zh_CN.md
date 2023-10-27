<div align="center">

<img alt="logo" src="./assets/chibi.png" width="200px">

# Chibi (琪比)
#### 一个全平台 Scratch 扩展加载器。

</div>

---

Chibi 是一个用户脚本，可以在任何基于 Scratch 的编辑器中加载第三方扩展（理论上）。
# ✨ 功能
- [x] 加载标准 Scratch 扩展
- [x] 加载非沙盒扩展
- [x] 加载使用 Turbowarp 专有扩展接口的扩展(部分)
- [ ] 提供一种不安装扩展也可以打开加载了第三方扩展的项目的方式
- [x] 直接从编辑器内加载

# 🌈 支持的平台
- [x] Scratch
- [x] 别针社区
- [x] Cocrea
- [x] 阿儿法营
- [x] 共创世界
- [x] 小码王
- [x] CodeLab
- [x] 40code
- [x] TurboWarp

# 🔥 使用方法
1. 安装一个用户脚本管理器扩展, 例如 Tampermonkey 或 Greasymonkey。
2. 打开[发布页](https://github.com/SimonShiki/chibi/releases), 点击一个版本来安装。
3. 在'自定义积木'分类栏中找到'Open Frontend'按钮，点击它即可侧载你的扩展。(你可能需要 5 秒来等待按钮出现)

> 嗯...也许因为编辑器差异，按钮并不会正常显示。不过别担心，你还可以通过其他的方式来侧载你的扩展！

1. 按 'F12' 来打开开发者工具。
2. 在控制台输入并执行 ``chibi.openFrontend()`` 或 ``chibi.loader.load([extensionURL], [load mode, like 'unsandboxed'])'``。
3. 大功告成!

# 🥰 贡献扩展
Chibi 的前端提供了一个扩展橱窗，你可以在其中任意挑选你喜欢的扩展。我们同样欢迎你将自己的扩展投稿至橱窗中。欲知详情请访问[moth](https://github.com/SimonShiki/moth)

# ⚓ 许可证
AGPL-3.0, 请看 [LICENSE](./LICENSE).
