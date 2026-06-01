# Blood on the Clocktower AI Copilot | 无上杀戮 - 《血染钟楼》 AI 战术助手

这是一个专为《血染钟楼》游戏玩家量身定制的纯前端单页面记录与逻辑推理辅助工具。系统通过高精度的超椭圆（Squircle）座位轨迹图、大盘约束校验器以及自然语言语义分析，实时同步并验证对局数据，并能接入前沿的大语言模型，为您提供深度的世界线分析、行动建议与私聊对抗策略。

This is a pure client-side, single-page visualizer and logical deduction assistant designed specifically for players of *Blood on the Clocktower*. Integrating a high-precision superellipse (squircle) seating chart, constraint-based logic validator, and natural language NLP parsing, it synchronizes live board states and leverages advanced LLMs to provide real-time tactical analyses, action advice, and chat strategies.

![对局界面示意图](screenshot.png)

---

## 🇨🇳 中文版说明

### 🛠️ 控制面板功能与使用说明

系统界面由三个核心功能面板组成，以下为各面板的详细结构、功能说明及操作指引。

#### 1. 👈 左侧面板：对局配置与管理
左侧面板负责系统的初始设置、模型网关接入及玩家底牌状态的快速维护。

* **中英双语切换**：
  * 点击主页顶栏的按钮，可以在中文与英文页面之间实时进行无缝切换。系统会自动将您的语言选择偏好记录到本地缓存中。
* **接口与模型配置**：
  * **功能**：用于选择大模型供应厂商（支持谷歌、微软、阿里等九大主流平台），并配置对应的推理模型名称、密钥及接口代理地址。
  * **使用方法**：折叠面板内默认已填入测试用谷歌密钥，开箱即用。若需使用其他厂商模型，请在下拉菜单中切换并填入对应密钥与代理地址。
* **新对局初始化**：
  * **功能**：配置本局对局的基础规则。
  * **使用方法**：设置本局游戏的总人数（支持 7 至 15 人本），并选择当前正在进行的剧本板子（支持《无上杀戮》、《暗流涌动》、《梦殒春宵》和《瓦釜雷鸣》），点击初始化按钮即可生效。
* **玩家状态快速调整**：
  * **功能**：实时展示所有玩家的座位号、当前宣称角色及生存状态，并提供详细状态编辑器。
  * **使用方法**：
    * **生存状态**：点击滑块可以快速切换该玩家的存活与死亡状态。
    * **详细编辑**：点击最右侧的编辑画笔图标，会弹出悬浮弹窗。在弹窗中，您可以为该玩家选择具体的宣称角色底牌、判定阵营（善良或邪恶）、是否处于中毒或醉酒状态，以及撰写自定义备忘录（如“自称是守鸦人让我别碰他”）。

---

#### 2. 🗺️ 中间面板：座位轨迹图、逻辑校验器与流水志
中间面板是整个游戏的物理局势沙盘与逻辑校验中心，负责图形化还原圆桌对局状态，实时校验逻辑冲突，并记录完整事件流水。

* **环形座位轨迹图**：
  * **功能**：直观展示玩家之间的物理相对位置及实时状态。
  * **视角旋转机制**：输入您自身的座位号，圆桌会自动旋转，将您的物理座位锁定在圆桌的正下方（6点钟方向），其余玩家节点按顺时针依次排布。此设计能帮助玩家从自身真实第一视角观测左邻右舍。
  * **超椭圆自适应布局**：采用高精超椭圆（拉梅曲线）算法。在横向极其宽敞的桌面屏幕下，系统会自动调整长宽比并将超椭圆指数平滑扩展至 2.45（经典的 Squircle 矩圆比例），让玩家节点自然向四角外延，彻底填满两侧的黑色深空留白；在手机等窄小视口下，系统基于视口尺寸动态等比例缩小节点直径（至 60 像素）并排版为竖向椭圆，配合流畅的字体自适应，在任何屏幕下都绝无重合、挤压或溢出。
  * **状态图示**：
    * 蓝色外圈代表善良阵营，红色外圈代表邪恶阵营。
    * 节点半透明且带暗灰边框表示该玩家已死亡。死亡节点内部会自动渲染一枚幽灵票存余指示灯，展示死票存余情况，点击可标记使用。
    * 节点带有紫色呼吸光晕代表该玩家当前被标记为中毒或醉酒。
    * 玩家节点之间的物理邻座连线与茶艺师等技能保护线实时动态渲染。
* **大盘逻辑校验与冲突追踪器**：
  * **功能**：系统核心的高级逻辑演算引擎，负责实时进行全局逻辑校验，包括：
    * **角色对跳冲突**：自动检测并追踪多名玩家宣称同一唯一角色（如对跳共情者、对跳占卜师）的冲突，在追踪面板中以高亮红色警报显示冲突座位号。
    * **外来者数量校验**：根据当前游戏人数读取对应的标准角色配置，与当前场上已起跳的外来者数量进行实时对比。当已起跳外来者数量溢出时自动发出警报，提示玩家关注坏人穿衣服或男爵、教父改配置的逻辑切入点。
    * **幽灵票存余统计**：实时汇总所有阵亡玩家的幽灵死票存余状态，清晰展示“存余死票 / 总死亡人数”，帮助好人团队精确规划处决轮次与死票防守线。
* **局势信息流水志**：
  * **功能**：按时间顺序自动记录对局中发生的所有逻辑变更、玩家状态更新以及白天输入框提交的进展描述。
  * **使用方法**：此部分为系统自动维护。该日志链会直接作为大语言模型的结构化输入上下文，确保其能够基于完整的历史对局脉络进行推演。当系统语言为英文时，AI 也会根据该上下文用英文做深度演算与输出。

---

#### 3. 👉 右侧面板：AI 战术副驾驶与智能同步终端
右侧面板为基于大语言模型的博弈推理输出终端，协助玩家分析逻辑漏洞。

* **输入本轮局势进展**：
  * **功能**：支持自然语言描述本轮发生的新信息（例如：“5号夜里死了。8号白天跳厨师，说信息是1”）。
  * **智能语义提取与自动状态追踪同步 [极客级功能]**：
    * 当您在右侧文本框录入白天局势进展并发送给 AI 时，系统会在后台运行一套高效的自然语言分析提取引擎。
    * 该引擎能够智能识别句中的“玩家座位 + 事件行为”（如：“5号夜里死了”自动将 5 号玩家设为死亡状态；“8号白天跳厨师”自动将 8 号宣称更新为“厨师”；“3号中毒了”自动给 3 号打上中毒高亮；“1号和2号对跳共情者”自动更新两人的宣称并瞬间触发大盘冲突警报）。
    * 这极大简化了玩家的手动点击操作，让您只用专注记录发言，物理座位图和大盘逻辑校验器将实时与您的文字描述同步！
  * **使用方法**：在文本域中录入最新的进展陈述，点击发送分析按钮。系统会清空输入框，将该进展归档至流水志，并向模型网关发起请求。
* **推理输出与私聊对话选项卡**：
  * 当页面切换为英文状态时，系统发送给接口的系统提示词负载会自动转换为高度结构化的英文，使 AI 即使面对中文的输入，也会全程以纯英文输出专业的世界线推演与战术对策。
  * **即时分析**：分析最新陈述中的逻辑冲突。结合圆桌收缩后的邻座变化，计算共情者、茶艺师等空间限制技能的边界是否产生异常。
  * **行动建议**：结合玩家的真实角色与真实阵营立场，为玩家提供本轮的战术行动策略（如：今天最适合私聊核对信息的玩家、投票环节的诱导挂票对象、以及一句话防死或进攻指引）。
  * **AI对话**：专为实战私密交谈设计。在对话框录入对局疑问发送后，文字气泡会瞬间在界面上追加显示，并立即拉起动态打字指示器，绝无等待期间界面死板无反应的缺陷。您可以在这里像日常聊天一样与副驾驶做更深度的私聊配合、漏洞盘问与策略推敲。

---

### 💡 实战案例演练：如何利用 AI Copilot 破解复杂局势

README 首图展示了一场真实的 **12 人局《暗流涌动》** 的第一白天博弈，完美展现了系统如何在极高阶的对局中协助邪恶阵营进行战术对抗：

#### 1. 游戏背景与当前局势
* **我的真实身份**：1 号座位，**「投毒者」**。我的邪恶队友是 2 号 **「玩家 2」**，其真实底牌是 **「小恶魔」**。
* **说书人给的伪装**：**「厨师」**、**「送葬者」**、**「共情者」**。
* **白天的公共发言**：
  * **5 号玩家** 跳了「厨师」，报信息为 **「1」**（表示场上存活玩家中，邪恶阵营相邻的对数有一对）。
  * **9 号玩家** 同样跳了「厨师」，报信息为 **「0」**（表示邪恶玩家互不相邻）。
  * 两人形成了直接的对跳冲突。

#### 2. 系统核心模块的实时联动
* **大盘逻辑校验与冲突追踪器**：
  * 面板立即抓取到 5 号和 9 号玩家的「厨师」宣称冲突，在面板中高亮红字报警显示 `厨师 (5号 & 9号) 对跳`，帮助玩家瞬间锁定逻辑风暴的中心。
  * **外来者数量校验** 与 **幽灵票统计** 自动检测到目前场上 0 位外来者起跳、12 人全员存活，展示出健康、未爆发冲突的外部大盘数据。
* **环形座位轨迹图**：
  * 物理连线系统自动锁定了 1 号（我）在正下方 6 点钟的视角位置。能够清晰看出：我（1号投毒者）与 2 号（小恶魔）物理相邻。

#### 3. AI Copilot 的高阶逻辑推演与战术剖析
基于魔典的绝对真实规则和收集到的发言，右侧的 AI 战术副驾驶在毫秒内得出了堪称大师级的博弈洞察：
* **逻辑死结拆解**：
  1. **邪恶相邻数理论上必然为 1**：因为 1 号（投毒者）与 2 号（小恶魔）物理相邻，场上必定至少有一对相邻的邪恶玩家，因此真实的厨师信息绝对是 **「1」**。
  2. **判定 9 号必假**：9 号报「0」违背了物理相邻事实，其厨师身份绝对为伪造。
  3. **判定 5 号存在疑点**：虽然 5 号报出的「1」刚好契合了真实的相邻数，但鉴于「厨师」在说书人给我们的邪恶伪装池中，5 号依然极有可能是假跳，或者是一位刚好处于醉酒或中毒状态、得到了错误真信息的村民。
* **AI 战术行动建议**：
  * AI 立即给出了针对邪恶阵营的毒辣行动方案：
    * **【今日核心任务】**：由于「厨师」在我们的伪装池里，我们拥有完美的真伪判定视角。立刻在白天与 2 号小恶魔队友打配合。
    * **【博弈挂票策略】**：利用好人团队对信息逻辑的执念，将 9 号（报0者）作为本轮首要的扛推目标（指责其伪造信息或穿在场村民衣服），白白消耗好人白天的处决轮次，确保 2 号小恶魔高枕无忧，平稳带节奏进入黑夜！

---

### 🚀 快速上手指南

本系统为纯前端单页面应用，数据完全保留在本地，无任何后端依赖。

#### 1. 本地启动
* **方法 A（直接打开）**：双击项目根目录下的 `index.html` 即可在浏览器中运行。
* **方法 B（本地 Web 服务器）**：在项目根目录下通过终端启动简易 Python 服务器：
  ```bash
  python -m http.server 8000
  ```
  在浏览器访问 `http://localhost:8000`。

#### 2. 调试与对局开始
1. 刷新页面（加载时系统会自动加载上一次的本地缓存偏好）。
2. 在左侧面板的新对局初始化中选择人数与剧本。
3. 在玩家状态快速调整中设定您的座位号与真实身份。
4. 随着对局推进，在右侧文本域输入新发生的发言与生死变动，点击发送，等待 AI 给出战术建议。

---

### 🔒 隐私与凭证安全
* 本工具无任何后台数据库，您的所有密钥、对局小记与历史分析结果均仅存储在您本地浏览器的本地存储中。
* 允许安全切换不同厂商大模型，若检测到前缀与当前厂商不匹配，系统会自动清空输入框，杜绝密钥泄露风险。

---

## 🇺🇸 English Version

### 🛠️ Control Panel Features & Operation

The interface consists of three core panels. Below are the functional details and operating guidelines.

#### 1. 👈 Left Panel: Setup & Management
This panel manages system initialization, AI gateway configs, and player state updates.

* **Bilingual Language Toggle**:
  * Click the language toggle button in the top header to seamlessly switch the entire layout and controls in real time. The system automatically persists your active language selection in local storage.
* **AI Engine Configuration**:
  * **Feature**: Select your API provider (supports 9 mainstream platforms, including Gemini, ChatGPT, Claude, DeepSeek, etc.) and configure your model ID, API Key, and Base URL.
  * **Usage**: A Google Gemini API test key is pre-filled by default for instant, out-of-the-box reasoning. If using another provider, select it from the dropdown and insert your endpoint details.
* **Initialize New Game**:
  * **Feature**: Establishes active board rules.
  * **Usage**: Set player count (supports 7 to 15 players) and select your current script (supports *Supreme Slaughter*, *Trouble Brewing*, *Sects & Violets*, and *Bad Moon Rising*), then click the initialization button.
* **Quick Status Adjustments**:
  * **Feature**: Offers a real-time list of all seat numbers, claimed characters, and survival statuses with a detail editor.
  * **Usage**:
    * **Survival Status**: Toggle the slider to instantly alternate a player's status between alive and dead.
    * **Detail Edit**: Click the edit pencil icon on the far right to trigger a hover popover modal. Inside this popup, you can modify the player's claimed role, set their suspected alignment (Good or Evil), flag them as drunk or poisoned, and write custom private notes (e.g., "Claimed Ravenkeeper, asked me not to target him").

---

#### 2. 🗺️ Center Panel: Seating Chart, Logic Validator & Action Logs
The sandtable visualizes the physical circular layout of players, dynamically calculates logical contradictions, and traces events chronologically.

* **Interactive Seating Circle**:
  * **Feature**: Graphic representation of players' physical seating arrangement and live markers.
  * **First-Person View Rotation**: Input your active seat number in the seat number field, and the circular visualizer automatically rotates to lock your seat node at the bottom-center (6 o'clock direction). All other seats are arranged clockwise. This visual perspective replicates your real view of the circular table.
  * **Superellipse Adaptive Layout**: Powered by a high-precision superellipse (Lamé Curve) algorithm. On spacious widescreen desktop monitors, the aspect ratio automatically scales, and the curve exponent smooths to 2.45 (the classic Squircle shape) to let player nodes extend naturally to the corners, eliminating dark empty spaces. On mobile screens, nodes scale down proportionally (to 55 pixels) and wrap into a vertical squircle layout. Together with adaptive font scaling, it guarantees zero node overlap, squeezing, or clipping.
  * **Status Diagrams**:
    * Blue rings signify a Good alignment; red rings signify Evil.
    * Semi-transparent nodes with gray borders indicate dead players. A glowing dead vote token is automatically rendered inside dead players' nodes. Click it to mark their final ghost vote as spent or active.
    * A purple breathing glow ring represents that a player is currently drunk or poisoned.
    * Dynamic adjacency lines and skill bounds (e.g. Tea Lady protection bounds) are rendered on the fly.
* **Deductive Validator Dashboard**:
  * **Feature**: A real-time constraint-solving engine that runs underneath the seating chart to flag logical anomalies instantly:
    * **Claim Collisions**: Detects when multiple players claim the same unique role (e.g., two players claiming "Chef" or "Undertaker") and highlights them in high-contrast red warnings.
    * **Outsider Count**: Compares the standard Outsider configuration for the current player size with the claimed Outsiders. Highlights anomalies in orange if claims exceed standards, hinting at "Baron bluffing" or "evil players claiming fake roles."
    * **Dead Ghost Votes**: Automatically aggregates the active ghost votes remaining among all dead players (e.g., "Active Dead Votes: 3 / 4") in a sleek neon badge, allowing perfect planning of execution rounds.
* **Game Action & Interaction Logs**:
  * **Feature**: Chronologically records all logical changes, state shifts, and daytime statements submitted from the console.
  * **Usage**: Completely automated. This log is directly injected as structured context payload into the AI reasoning prompt, ensuring logically grounded worldline deductions.

---

#### 3. 👉 Right Panel: AI Tactical Copilot & Smart Sync Terminal
A specialized large language model terminal designed to calculate contradictions, locate logical holes, and frame strategies.

* **Enter Current Turn Updates**:
  * **Feature**: Supports natural language entry of events (e.g., *"Seat 5 died tonight. Seat 8 claimed Chef with a '1' in the morning"*).
  * **NLP Smart Command Parser (Auto-Sync) [Premium Feature]**:
    * When you type daytime turn updates and send them to the AI, a background natural language processing parser automatically intercepts the text.
    * Supporting both English and Chinese, it extracts player states (e.g. *"Seat 5 died"* sets Seat 5 to Dead; *"Seat 8 claimed Chef"* sets Seat 8's claim to "Chef"; *"Seat 3 is poisoned"* highlights Seat 3 in purple; *"Seat 1 and 2 claim Empath"* triggers a claim collision alert).
    * This bridges the gap between text entry and the visual board, letting you take notes naturally while the visual circle and Deductive Validator sync in real time!
  * **Usage**: Enter your statements, and click the yellow analyze button. The input clears, logs the event, and queries the LLM gateway.
* **Analysis & Dialogue Tabs**:
  * When the active language is English, the prompt payload transmitted to the API is automatically translated into structured English. This instructs the AI to reason and return all analyses strictly in English, despite the Chinese input labels.
  * **Instant Analysis**: Highlights logic clashes in claims. Tracks adjacency shifts as seats shrink (e.g., Empath's new targets, Tea Lady's protective bounds) to flag anomalies.
  * **Tactical Tips**: Provides actionable advice based on your **real character** and **true alignment** (e.g., optimal private chat targets to test or cover, voting strategies to push nominations, and a one-sentence warning).
  * **AI Chat**: Designed for immersive in-game private consulting. When you send custom questions, chat bubbles render instantly with a dynamic typing indicator, avoiding any static lag. Here, you can ask for detailed bluffs, logic checks, or tailored tactical execution steps.

---

### 💡 Real-world Walkthrough: Utilizing AI Copilot to Crack Complex Boards

The README screenshot displays a real game of **12-Player Trouble Brewing** during Day 1, demonstrating how the system supports the Evil team in high-level play:

#### 1. Game Background & Current Setup
* **My Real Character**: Seat 1, **Poisoner** (Evil alignment). My teammate is Seat 2, the **Imp**.
* **Demon Bluffs**: **Chef**, **Undertaker**, **Empath**.
* **Daytime Public Claims**:
  * **Seat 5** claims Chef with a **"1"** (indicating that exactly one pair of alive evil players sits adjacent to each other).
  * **Seat 9** also claims Chef with a **"0"** (indicating that evil players are not adjacent).
  * These two claims form a direct collision.

#### 2. Real-time Module Synergy
* **Deductive Validator Dashboard**:
  * Instantly detects the Chef claim conflict, highlighting it in red: `Chef (Seat 5 & Seat 9) Collision`.
  * **Outsider Count** and **Ghost Votes** show that 0 Outsiders have claimed, and all 12 players are alive, establishing standard baseline conditions.
* **Interactive Seating Circle**:
  * Locks Seat 1 (me) at the bottom-center (6 o'clock direction) to reflect my physical viewpoint. It clearly visualizes that I (Seat 1, Poisoner) am physically adjacent to Seat 2 (Imp).

#### 3. AI Copilot Deep Deduction & Tactical Suggestions
Based on absolute game rules and visual cues, the AI Copilot delivers master-class tactical advice within milliseconds:
* **Logical Paradox Breakdown**:
  1. **Evil Adjacency Must Be 1**: Since Seat 1 (Poisoner) sits adjacent to Seat 2 (Imp), there is definitely at least one adjacent evil pair. Thus, the true Chef info must be **"1"**.
  2. **Seat 9 is Checked False**: Seat 9's claim of "0" directly contradicts physical reality. Seat 9 is guaranteed to be a faking player.
  3. **Seat 5 Remains Suspected**: Even though Seat 5's claim of "1" matches reality, since "Chef" is in our Demon Bluff pool, Seat 5 is highly likely a faking townsfolk or a drunk/poisoned townsfolk.
* **AI Action Strategy**:
  * The AI advises the following path for the Evil team:
    * **Immediate Collaboration**: Coordinate with Seat 2 (Imp) in private. Since we own the Chef bluff, we hold the absolute perspective.
    * **Strategic Voting**: Exploit the good team's logic biases to frame Seat 9 (claiming "0") as a faking minion or a drunk/poisoned townsfolk. Push nominations to execute them, successfully wasting the Good team's execution round while keeping our Seat 2 Imp perfectly safe!

---

### 🚀 Quick Start Guide

As a pure client-side single-page application, all computations and configurations run locally in your web browser.

#### 1. Running Locally
* **Method A (Direct Run)**: Double-click the `index.html` file in your file explorer to open it in any browser.
* **Method B (Local HTTP Web Server)**: Open your terminal in the repository root directory and start a lightweight Python server:
  ```bash
  python -m http.server 8000
  ```
  Then, navigate to `http://localhost:8000` in your web browser.

#### 2. Beginning a Game
1. Refresh the page (your language preferences and configurations will auto-restore from local storage).
2. Set your player count and script in the collapsible "Initialize New Game" panel.
3. Configure your seat number and real character in the player grid.
4. As the game proceeds, speak or type turn events in the right terminal console, click analyze, and explore the AI's tactical suggestions!

---

### 🔒 Privacy & API Credential Security
* The application operates entirely without any remote database backend. Your API keys, game notes, and timeline histories are stored securely in your browser's private local storage.
* When switching models, the system automatically purges keys that don't match the new provider, eliminating key leak risks.

---

## 📝 License
This project is open-sourced under the [MIT License](LICENSE).
