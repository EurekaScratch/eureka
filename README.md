<div align="center">

<img alt="logo" src="./assets/chibi.png" width="200px">

# Chibi
#### Load scratch extension everywhere.

</div>

---

Chibi is a userscript which can load 3rd-party extensions in any Scratch-based editors (theoretically).
# ✨ Features
- [x] Load Scratch standard extensions
- [x] Unsandboxed extensions
- [x] TurboWarp Extension API (very small part)
- [ ] Fallback solution for visitors without script installation
- [ ] Load from editor

# 🌈 Supported platforms
- [x] Scratch
- [x] Codingclip
- [x] Cocrea
- [x] Aerfaying (阿儿法营)
- [x] Co-Create World (共创世界)
- [x] Xiaomawang (小码王)
- [x] CodeLab
- [x] 40code
- [x] TurboWarp

# 🔥 Usage
1. Install UserScript Manager like Tampermonkey or Greasymonkey.
2. Open [release](https://github.com/SimonShiki/chibi/releases), Then click one release to install.
3. Find '😎 Chibi Management' button in 'My Blocks' category. you can sideload your extension by clicking it. You may have to wait 5 seconds to make the button appeared.

> Or... Due to editor differences, the button may not appear. There are other ways you can sideload extensions.   

1. Press 'F12' on your keyboard to open Developer Tools.
2. Input ``chibi.openFrontend()`` or ``chibi.loader.load([extensionURL], [load mode, like 'unsandboxed'])'`` In your console, then enter to execute.
3. Your extension got loaded!

# ⚓ License
AGPL-3.0, see [LICENSE](./LICENSE).
