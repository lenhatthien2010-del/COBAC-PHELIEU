import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        let isUsingFirebase = false;
        let app, auth, db, appId;

        try {
            if (typeof __firebase_config !== 'undefined') {
                const firebaseConfig = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
                appId = typeof __app_id !== 'undefined' ? __app_id : 'default-cobac';
                app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                db = getFirestore(app);
                isUsingFirebase = true;
            }
        } catch(e) {
            console.warn("Running in local mode.");
        }

        const rollSound = new Audio('roll.mp3');

        const RARITIES = {
            ULTIMATE:  { label: 'ULTIMATE', color: '#10b981', priority: 9 }, 
            LIMITED:   { label: 'LIMITED', color: '#22d3ee', priority: 8 },
            GODLY:     { label: 'GODLY', color: '#eab308', priority: 7 },
            MYTHIC:    { label: 'MYTHIC', color: '#ef4444', priority: 6 },
            LEGENDARY: { label: 'LEGENDARY', color: '#f59e0b', priority: 5 },
            MYSTIC:    { label: 'MYSTIC', color: '#a855f7', priority: 4 },
            RARE:      { label: 'RARE', color: '#3b82f6', priority: 3 },
            NATURAL:   { label: 'NATURAL', color: '#22c55e', priority: 2 },
            BASIC:     { label: 'BASIC', color: '#94a3b8', priority: 1 },
            SPECIAL:   { label: 'PACK', color: '#a855f7', priority: 0 }
        };

        const ELEMENT_POOL = [
            { name: "Phóng xạ", rarity: "ULTIMATE", weight: 0.001, price: 50000000, icon: "☢️" }, 
            { name: "Quỷ", rarity: "GODLY", weight: 0.0001, price: 25000000, icon: "👿" },
            { name: "Tinh Tú", rarity: "GODLY", weight: 0.001, price: 15000000, icon: "🌟" },
            { name: "Sáng Thế", rarity: "GODLY", weight: 0.01, price: 10000000, icon: "👁️" },
            { name: "Vĩnh Hằng", rarity: "GODLY", weight: 0.01, price: 5000000, icon: "♾️" },
            { name: "Hỗn Mang", rarity: "GODLY", weight: 0.01, price: 2500000, icon: "💥" },
            { name: "Sự Sống", rarity: "MYTHIC", weight: 0.3, price: 1200000, icon: "🧬" },
            { name: "Không Gian", rarity: "MYTHIC", weight: 0.3, price: 950000, icon: "🌀" },
            { name: "Thời Gian", rarity: "MYTHIC", weight: 0.3, price: 800000, icon: "⏳" },
            { name: "Vũ Trụ", rarity: "LEGENDARY", weight: 0.4, price: 450000, icon: "☄️" },
            { name: "Âm Dương", rarity: "LEGENDARY", weight: 0.4, price: 300000, icon: "☯️" },
            { name: "Huyết Nguyệt", rarity: "LEGENDARY", weight: 0.4, price: 220000, icon: "🩸" },
            { name: "Hư Không", rarity: "LEGENDARY", weight: 0.4, price: 150000, icon: "🌌" },
            { name: "Pha Lê", rarity: "MYSTIC", weight: 3.0, price: 85000, icon: "🔮" },
            { name: "Ánh Sáng", rarity: "MYSTIC", weight: 3.5, price: 70000, icon: "✨" },
            { name: "Bóng Tối", rarity: "MYSTIC", weight: 4.0, price: 65000, icon: "🌑" },
            { name: "Kim Cương", rarity: "MYSTIC", weight: 4.5, price: 50000, icon: "💎" },
            { name: "Khói", rarity: "MYSTIC", weight: 5.0, price: 35000, icon: "🌫️" },
            { name: "Sấm Sét", rarity: "RARE", weight: 6.0, price: 15000, icon: "⚡" },
            { name: "Băng Giá", rarity: "RARE", weight: 6.5, price: 12500, icon: "❄️" },
            { name: "Vàng", rarity: "RARE", weight: 7.0, price: 10000, icon: "🪙" },
            { name: "Dung Nham", rarity: "RARE", weight: 7.5, price: 8500, icon: "🌋" },
            { name: "Bạc", rarity: "RARE", weight: 8.0, price: 6000, icon: "🥈" },
            { name: "Lửa", rarity: "NATURAL", weight: 10.0, price: 2500, icon: "🔥" },
            { name: "Nước", rarity: "NATURAL", weight: 10.5, price: 2200, icon: "💧" },
            { name: "Gió", rarity: "NATURAL", weight: 11.0, price: 1800, icon: "🌪️" },
            { name: "Thiên Nhiên", rarity: "NATURAL", weight: 11.5, price: 1500, icon: "🌿" },
            { name: "Sắt", rarity: "NATURAL", weight: 12.0, price: 1200, icon: "⛓️" },
            { name: "Đất", rarity: "BASIC", weight: 15.0, price: 500, icon: "🪨" },
            { name: "Sỏi", rarity: "BASIC", weight: 16.0, price: 350, icon: "🏜️" },
            { name: "Than", rarity: "BASIC", weight: 17.0, price: 200, icon: "⬛" },
            { name: "Cát", rarity: "BASIC", weight: 18.0, price: 100, icon: "🏖️" },
            { name: "Đồng", rarity: "BASIC", weight: 20.0, price: 50, icon: "🥉" }
        ];
        
        const LIMITED_ELEMENTS = [
            { name: "Summer2026 Limited", rarity: "LIMITED", weight: 0, price: 50000000, icon: "🍍", isLimited: true, displayPrice: "Buff Tiền/Wave" }
        ];

        const TD_STATS = {
            BASIC:     { cost: 10,  dmg: 5,   range: 100, cd: 60 },
            NATURAL:   { cost: 25,  dmg: 15,  range: 120, cd: 55 },
            RARE:      { cost: 50,  dmg: 40,  range: 140, cd: 50 },
            MYSTIC:    { cost: 100, dmg: 100, range: 160, cd: 40 },
            LEGENDARY: { cost: 300, dmg: 350, range: 180, cd: 35 },
            MYTHIC:    { cost: 800, dmg: 1000, range: 220, cd: 30 },
            GODLY:     { cost: 2500, dmg: 4000, range: 350, cd: 20 },
            LIMITED:   { cost: 4000, dmg: 0, range: 100, cd: 999 },
            ULTIMATE:  { cost: 8000, dmg: 15000, range: 500, cd: 15 } 
        };

        const getVFXClass = (name) => {
            if (name === "Quỷ") return "glow-quy";
            if (name === "Phóng xạ") return "glow-phongxa";
            return "";
        };

        // Helper cho Cầu vồng ULTIMATE
        const getRarityTextClass = (rarity) => rarity === 'ULTIMATE' ? 'text-rainbow' : '';
        const getRarityStyle = (rarity) => rarity === 'ULTIMATE' ? 'color: transparent;' : `color: ${RARITIES[rarity].color}`;

        let inventory = [];
        let balance = 0; 
        let tdWins = 0; // Biến lưu trữ lượt thắng
        let currentUser = null;
        let currentPage = 1;
        const itemsPerPage = 6;
        let currentSelectedItem = null;
        let skills = { autoRoll: false, lucky: false, speedX2: false, autoSell: false, x2Sell: false };
        let autoSellSettings = { enabled: false, filters: [] };
        let usedCodes = [];
        let lastPackBuyTimes = { mythicCombo: 0, godlySingle: 0 };
        let isAutoOn = false; 
        let isRolling = false;
        let autoRollInterval = null;

        let dealerShopData = { items: [], nextRestock: 0 };

        let activeBot = null;
        let userTradeItem = null;
        let botTradeItem = null;
        let botWillAccept = false;
        let botWillSell = false; 

        const showNotif = (text, icon = "🔔") => {
            const bar = document.getElementById('notif-bar');
            document.getElementById('notif-text').innerText = text;
            document.getElementById('notif-icon').innerText = icon;
            bar.classList.add('show');
            setTimeout(() => bar.classList.remove('show'), 2000);
        };

        const updateSyncUI = (status) => {
            const dot = document.getElementById('sync-dot');
            const text = document.getElementById('sync-text');
            if(status === 'connected') {
                dot.className = "w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]";
                text.innerText = isUsingFirebase ? "ĐÃ ĐỒNG BỘ CLOUD" : "ĐÃ LƯU BẢN ĐỊA";
            } else if (status === 'syncing') {
                dot.className = "w-2 h-2 rounded-full bg-yellow-500 animate-pulse";
                text.innerText = "ĐANG LƯU...";
            } else {
                dot.className = "w-2 h-2 rounded-full bg-red-500";
                text.innerText = "NGOẠI TUYẾN";
            }
        };

        const saveToCloud = async () => {
            if(!currentUser) return;
            updateSyncUI('syncing');
            try {
                const dataToSave = { 
                    inventory, skills, balance, usedCodes, lastPackBuyTimes, autoSellSettings,
                    dealerShopData, tdWins, lastUpdate: new Date().toISOString()
                };

                if (isUsingFirebase) {
                    const userDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'gameData');
                    await setDoc(userDocRef, dataToSave, { merge: true });
                } else {
                    localStorage.setItem('legacy_collection_save_v2', JSON.stringify(dataToSave));
                }
                updateSyncUI('connected');
            } catch (e) {
                console.error("Save failed", e);
                updateSyncUI('error');
            }
        };

        const updateStats = () => {
            const totalItems = inventory.reduce((sum, item) => sum + (item.count || 1), 0);
            const totalValue = inventory.reduce((sum, item) => sum + (item.price * (item.count || 1)), 0);
            const uniqueOwned = new Set(inventory.map(i => i.name)).size;
            const totalPoolCount = ELEMENT_POOL.length + LIMITED_ELEMENTS.length;
            
            document.getElementById('stats-count').innerText = totalItems.toLocaleString();
            document.getElementById('stats-value').innerText = totalValue.toLocaleString() + '$';
            document.getElementById('stats-balance').innerText = balance.toLocaleString() + '$';
            document.getElementById('inventory-count-text').innerText = `${totalItems} VẬT PHẨM (${inventory.length} LOẠI)`;
            document.getElementById('collection-progress-text').innerText = `TIẾN ĐỘ: ${uniqueOwned}/${totalPoolCount}`;
            document.getElementById('td-wins-count').innerText = tdWins; // Cập nhật text huy hiệu TD
            
            if (skills.autoRoll) document.getElementById('auto-roll-control').classList.remove('hidden');
            if (skills.autoSell) {
                document.getElementById('auto-sell-control').classList.remove('hidden');
                renderAutoSellFilters();
            }
            updateShopUI();
            updatePackButtonStates();
        };

        const renderAutoSellFilters = () => {
            const container = document.getElementById('auto-sell-filters');
            if (container.children.length > 0) return;
            Object.keys(RARITIES).reverse().forEach(rarityKey => {
                if(rarityKey === 'SPECIAL' || rarityKey === 'LIMITED' || rarityKey === 'ULTIMATE') return;
                const isChecked = autoSellSettings.filters.includes(rarityKey);
                const item = document.createElement('div');
                item.innerHTML = `
                    <input type="checkbox" id="filter-${rarityKey}" class="hidden rarity-checkbox" ${isChecked ? 'checked' : ''} onchange="updateAutoSellFilter('${rarityKey}', this.checked)">
                    <label for="filter-${rarityKey}" class="block text-[8px] font-black text-center py-2 rounded-lg border border-slate-800 cursor-pointer transition-all hover:border-slate-600">
                        ${rarityKey}
                    </label>
                `;
                container.appendChild(item);
            });
        };

        window.updateAutoSellFilter = (rarity, checked) => {
            if (checked) {
                if (!autoSellSettings.filters.includes(rarity)) autoSellSettings.filters.push(rarity);
            } else {
                autoSellSettings.filters = autoSellSettings.filters.filter(f => f !== rarity);
            }
            saveToCloud();
        };

        window.handleAutoSellToggle = (checked) => {
            autoSellSettings.enabled = checked;
            showNotif(checked ? "ĐÃ BẬT TỰ ĐỘNG BÁN" : "ĐÃ TẮT TỰ ĐỘNG BÁN", checked ? "🤖" : "🛑");
            saveToCloud();
        };

        const updateShopUI = () => {
            ['autoRoll', 'lucky', 'speedX2', 'autoSell', 'x2Sell'].forEach(key => {
                const btn = document.getElementById(`buy-${key}`);
                if (btn && skills[key]) {
                    btn.innerText = "ĐÃ SỞ HỮU";
                    btn.disabled = true;
                    btn.className = "px-6 py-2 bg-slate-800 text-slate-500 font-black rounded-xl text-xs uppercase";
                }
            });
        };

        const PACK_COOLDOWNS = { mythicCombo: 30 * 60 * 1000, godlySingle: 60 * 60 * 1000 };

        const updatePackButtonStates = () => {
            const now = Date.now();
            Object.keys(PACK_COOLDOWNS).forEach(type => {
                const lastBuy = lastPackBuyTimes[type] || 0;
                const waitTime = PACK_COOLDOWNS[type];
                const elapsed = now - lastBuy;
                const btnOpen = document.getElementById(`btn-buy-${type}-open`);
                const btnPack = document.getElementById(`btn-buy-${type}-pack`);
                const labelTime = document.getElementById(`time-${type}`);
                
                if (lastBuy > 0 && elapsed < waitTime) {
                    const remaining = waitTime - elapsed;
                    const mins = Math.floor(remaining / 60000);
                    const secs = Math.floor((remaining % 60000) / 1000);
                    
                    if (labelTime) { 
                        labelTime.innerText = `ĐANG HẾT HÀNG ${mins}P ${secs}S CÓ HÀNG`;
                        labelTime.classList.replace('text-green-400', type==='mythicCombo'?'text-purple-400':'text-yellow-500');
                    }
                    if (btnOpen) { btnOpen.disabled = true; btnOpen.innerText = "HẾT HÀNG"; }
                    if (btnPack) { btnPack.disabled = true; btnPack.innerText = "HẾT HÀNG"; }
                } else {
                    if (labelTime) { 
                        labelTime.innerText = `SẴN SÀNG - CÓ THỂ MUA`;
                        labelTime.classList.replace(type==='mythicCombo'?'text-purple-400':'text-yellow-500', 'text-green-400');
                    }
                    if (btnOpen) { btnOpen.disabled = false; btnOpen.innerText = type==='godlySingle' ? "MỞ NGAY (+1 KHO)" : "MỞ NGAY (+3 KHO)"; }
                    if (btnPack) { btnPack.disabled = false; btnPack.innerText = "MUA DẠNG PACK"; }
                }
            });

            const btnSummer = document.getElementById('btn-buy-summer');
            if (btnSummer) {
                if (inventory.some(i => i.name === 'Summer2026 Limited')) {
                    btnSummer.disabled = true; btnSummer.innerText = "ĐÃ SỞ HỮU";
                    btnSummer.className = "bg-slate-700 text-slate-400 py-4 rounded-xl font-black text-[10px] uppercase";
                } else {
                    btnSummer.disabled = false; btnSummer.innerText = "MUA VÀ MỞ NGAY";
                    btnSummer.className = "bg-cyan-500 text-slate-950 py-4 rounded-xl font-black text-[10px] uppercase press-effect hover:bg-cyan-400 transition-colors";
                }
            }
        };

        setInterval(updatePackButtonStates, 1000);

        window.adminGiveAll = () => {
            ELEMENT_POOL.forEach(el => {
                const existingIdx = inventory.findIndex(i => i.name === el.name);
                if (existingIdx !== -1) {
                    inventory[existingIdx].count = (inventory[existingIdx].count || 1) + 1;
                } else {
                    inventory.push({
                        id: Date.now() + Math.random().toString(36).substr(2, 5),
                        name: el.name, icon: el.icon, rarity: el.rarity, price: el.price, count: 1,
                        timestamp: new Date().toISOString()
                    });
                }
            });
            showNotif("GIVE ALL SUCCESS!", "🎁"); updateStats(); saveToCloud();
        };

        window.adminGiveMoney = () => {
            const input = document.getElementById('admin-money-input');
            const amount = parseInt(input.value);
            if (isNaN(amount)) return;
            balance += amount; showNotif(`+${amount.toLocaleString()}$`, "💸"); updateStats(); saveToCloud(); input.value = '';
        };

        window.adminGiveElement = () => {
            const input = document.getElementById('admin-ele-input');
            const raw = input.value.trim();
            if (!raw) return;
            let name = raw, countToAdd = 1;
            if (raw.includes('+')) {
                const parts = raw.split('+');
                name = parts[0].trim(); countToAdd = parseInt(parts[1]) || 1;
            }
            const element = [...ELEMENT_POOL, ...LIMITED_ELEMENTS].find(e => e.name.toLowerCase() === name.toLowerCase());
            if (element) {
                const existingIdx = inventory.findIndex(i => i.name === element.name);
                if (existingIdx !== -1) inventory[existingIdx].count = (inventory[existingIdx].count || 1) + countToAdd;
                else {
                    inventory.push({
                        id: Date.now() + Math.random().toString(36).substr(2, 5),
                        name: element.name, icon: element.icon, rarity: element.rarity, price: element.price, count: countToAdd,
                        timestamp: new Date().toISOString(), isLimited: element.isLimited, displayPrice: element.displayPrice
                    });
                }
                showNotif(`GIVE ${element.name} x${countToAdd}`, "📦"); updateStats(); saveToCloud();
            } else { showNotif("KHÔNG TÌM THẤY!", "⚠️"); }
            input.value = '';
        };

        const generateDealerItems = () => {
            let newItems = [];
            while(newItems.length < 6) {
                let r = Math.random() * 100, target;
                if(r < 0.1) target = 'GODLY'; 
                else if (r < 2.0) target = 'MYTHIC';
                else if (r < 10.0) target = 'LEGENDARY'; 
                else if (r < 30.0) target = 'MYSTIC';
                else if (r < 60.0) target = 'RARE';
                else target = 'NATURAL';

                let pool = ELEMENT_POOL.filter(e => e.rarity === target);
                
                if (target === 'GODLY') {
                    let subR = Math.random();
                    if (subR < 0.1) pool = pool.filter(e => e.name === "Quỷ");
                    else if (subR < 0.2) pool = pool.filter(e => e.name === "Tinh Tú");
                    else pool = pool.filter(e => e.name !== "Quỷ" && e.name !== "Tinh Tú");
                }

                if(pool.length > 0) {
                    const item = pool[Math.floor(Math.random() * pool.length)];
                    if(!newItems.find(i => i.name === item.name)) newItems.push({ ...item, isBought: false, dealerId: Math.random().toString(36) });
                }
            }
            newItems.sort((a,b) => (RARITIES[a.rarity]?.priority || 0) - (RARITIES[b.rarity]?.priority || 0));
            dealerShopData.items = newItems; dealerShopData.nextRestock = Date.now() + 20 * 60 * 1000;
            saveToCloud(); renderDealerShop();
        };

        const renderDealerShop = () => {
            const grid = document.getElementById('dealer-grid');
            if(!grid) return;
            grid.innerHTML = '';
            
            if(!dealerShopData || !dealerShopData.items || dealerShopData.items.length === 0) {
                grid.innerHTML = `<div class="col-span-3 text-center text-slate-500 text-xs py-4">Đang chuẩn bị hàng...</div>`; return;
            }

            dealerShopData.items.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = `dealer-item bg-slate-800/80 border border-slate-700 rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-700 transition-colors ${item.isBought ? 'bought' : ''} ${getVFXClass(item.name)}`;
                
                let buyPrice = item.price * 2; 
                div.innerHTML = `
                    <div class="text-2xl">${item.icon}</div>
                    <div class="text-[8px] font-black uppercase mt-1 truncate w-full px-1 ${getRarityTextClass(item.rarity)}" style="${getRarityStyle(item.rarity)}">${item.name}</div>
                    <div class="text-[8px] font-bold text-yellow-500 mt-1">${buyPrice.toLocaleString()}$</div>
                `;
                
                if(!item.isBought) {
                    div.onclick = () => {
                        if(balance < buyPrice) { showNotif("KHÔNG ĐỦ TIỀN!", "❌"); return; }
                        balance -= buyPrice; dealerShopData.items[index].isBought = true;
                        
                        const existingIdx = inventory.findIndex(i => i.name === item.name);
                        if (existingIdx !== -1) inventory[existingIdx].count = (inventory[existingIdx].count || 1) + 1;
                        else {
                            inventory.push({
                                id: Date.now() + Math.random().toString(36).substr(2, 5),
                                name: item.name, icon: item.icon, rarity: item.rarity, price: item.price, count: 1, timestamp: new Date().toISOString()
                            });
                        }
                        showNotif(`ĐÃ MUA ${item.name} TỪ CHỢ ĐEN!`, "🧳"); updateStats(); saveToCloud(); renderDealerShop();
                    };
                }
                grid.appendChild(div);
            });
        };

        const updateDealerTimer = () => {
            const timerEl = document.getElementById('dealer-timer');
            if(!timerEl) return;
            const now = Date.now();
            if(now > dealerShopData.nextRestock) generateDealerItems();
            else {
                const diff = dealerShopData.nextRestock - now;
                const m = Math.floor(diff / 60000); const s = Math.floor((diff % 60000) / 1000);
                timerEl.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
        };
        setInterval(updateDealerTimer, 1000);

        // ==========================================
        // TRADE LOGIC NÂNG CẤP
        // ==========================================
        const rerollBotItem = () => {
            botTradeItem = {...activeBot.pool[Math.floor(Math.random() * activeBot.pool.length)]};
            botTradeItem.buyoutPrice = Math.floor(botTradeItem.price * (Math.random() * 0.5 + 1.5));
            if (activeBot.type === 'traveler' && botTradeItem.name !== "Phóng xạ") botTradeItem.customPrice = Math.floor(botTradeItem.price * 1.5);
            if (botTradeItem.name === "Phóng xạ") botTradeItem.buyoutPrice = Infinity; 
        };

        window.openTradeCenter = () => {
            const botChance = Math.random();
            let randomType = 'normal';
            if (botChance < 0.1) randomType = 'pro';
            else if (botChance < 0.2) randomType = 'traveler';
            
            const botAvatars = { normal: ["🤖", "🤵", "🎭"], pro: ["👑", "🕶️"], traveler: ["🐪", "🎒"] };
            const botNames = { normal: "BOT MERCHANT", pro: "PRO TRADER 👑", traveler: "TRAVELING MERCHANT 🎒" };
            
            activeBot = {
                type: randomType, name: botNames[randomType],
                avatar: botAvatars[randomType][Math.floor(Math.random()*botAvatars[randomType].length)]
            };

            document.getElementById('trade-money-input').value = ""; 

            // Cấu hình pool bot theo yêu cầu
            if (randomType === 'traveler') {
                activeBot.lossTolerance = (Math.random() < 0.3) ? 0.85 : 1.0; 
                if (Math.random() < 0.3) activeBot.pool = ELEMENT_POOL.filter(e => e.rarity === 'GODLY');
                else activeBot.pool = ELEMENT_POOL.filter(e => RARITIES[e.rarity].priority <= 6); 
                
                if (Math.random() < 0.01) activeBot.pool = [ELEMENT_POOL.find(e => e.name === "Phóng xạ")];
            } else if (randomType === 'pro') {
                const highTierPool = ELEMENT_POOL.filter(e => RARITIES[e.rarity].priority >= 6);
                activeBot.wantedItem = highTierPool[Math.floor(Math.random() * highTierPool.length)].name;
                
                if (Math.random() < 0.2) activeBot.pool = ELEMENT_POOL.filter(e => e.rarity === 'GODLY');
                else activeBot.pool = ELEMENT_POOL.filter(e => RARITIES[e.rarity].priority >= 4); 
            } else { // normal
                if (Math.random() < 0.01) activeBot.pool = ELEMENT_POOL.filter(e => e.rarity === 'GODLY');
                else activeBot.pool = ELEMENT_POOL.filter(e => RARITIES[e.rarity].priority <= 5);
            }

            rerollBotItem();

            let typeLabel = "THƯƠNG NHÂN THƯỜNG";
            let quote = "Giao dịch không? Có thể trả bằng tiền mặt đấy.";
            if (botTradeItem.name === "Phóng xạ") {
                typeLabel = "THƯƠNG NHÂN BÍ ẨN";
                quote = "Ta có thứ sức mạnh tối thượng. Ngươi có Quỷ và 30,000,000$ không?";
            } else if (randomType === 'pro') {
                typeLabel = "BOSS PRO TRADER";
                quote = `Ê mày có ${activeBot.wantedItem} không? Mua đứt cũng được nếu tiền to.`;
            } else if (randomType === 'traveler') {
                typeLabel = "THƯƠNG NHÂN DU HÀNH";
                quote = "Tôi mang theo những thứ từ phương xa.";
            }
            
            document.getElementById('bot-name').innerText = activeBot.name;
            document.getElementById('bot-avatar').innerText = activeBot.avatar;
            document.getElementById('bot-quote').innerText = `"${quote}"`;
            document.getElementById('bot-type-display').innerText = typeLabel;
            userTradeItem = null; updateTradeUI();
            document.getElementById('trade-modal').classList.remove('hidden');
        };

        window.closeTradeCenter = () => document.getElementById('trade-modal').classList.add('hidden');

        window.openTradeInventory = () => {
            const grid = document.getElementById('trade-inventory-grid');
            grid.innerHTML = '';
            if(inventory.length === 0) grid.innerHTML = '<p class="col-span-full text-center text-slate-600 py-10 text-xs font-bold uppercase">Kho trống</p>';
            
            if(userTradeItem) {
                const cancelDiv = document.createElement('div');
                cancelDiv.className = `bg-red-900/50 p-3 rounded-2xl border border-red-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-red-800`;
                cancelDiv.onclick = () => { 
                    userTradeItem = null; document.getElementById('trade-inv-modal').classList.add('hidden'); 
                    rerollBotItem(); updateTradeUI(); 
                };
                cancelDiv.innerHTML = `<div class="text-2xl">❌</div><div class="text-[10px] text-white font-bold uppercase mt-2">Bỏ Chọn Đồ (Chỉ dùng tiền)</div>`;
                grid.appendChild(cancelDiv);
            }

            inventory.forEach(item => {
                const isLim = item.isLimited === true;
                const div = document.createElement('div');
                div.className = `bg-slate-800/50 p-3 rounded-2xl border border-slate-700 flex flex-col items-center text-center cursor-pointer hover:bg-slate-700 ${isLim ? 'limited-block' : ''} ${getVFXClass(item.name)}`;
                
                if (!isLim) {
                    div.onclick = () => {
                        userTradeItem = item; document.getElementById('trade-inv-modal').classList.add('hidden'); 
                        rerollBotItem(); updateTradeUI();
                    };
                }
                div.innerHTML = `<div class="text-2xl">${item.icon}</div><div class="text-[8px] font-black mt-1 ${getRarityTextClass(item.rarity)}" style="${getRarityStyle(item.rarity)}">${item.rarity}</div><div class="text-[10px] font-bold uppercase truncate w-full">${item.name}</div>`;
                grid.appendChild(div);
            });
            document.getElementById('trade-inv-modal').classList.remove('hidden');
        };

        window.updateTradeUI = () => {
            let uMoney = parseInt(document.getElementById('trade-money-input').value) || 0;
            const userSlot = document.getElementById('user-trade-slot');
            const botSlot = document.getElementById('bot-trade-slot');
            const btn = document.getElementById('btn-confirm-trade');
            const msg = document.getElementById('trade-status-msg');
            const icon = document.getElementById('trade-status-icon');
            const comparison = document.getElementById('trade-comparison');
            const userValDisp = document.getElementById('user-val-display');
            const botValDisp = document.getElementById('bot-val-display');

            let uVal = uMoney;
            if (userTradeItem) {
                uVal += userTradeItem.price;
                userSlot.className = `trading-slot active ${getVFXClass(userTradeItem.name)}`;
                userSlot.innerHTML = `<div class="flex flex-col items-center"><div class="text-3xl">${userTradeItem.icon}</div><div class="text-[9px] font-black uppercase mt-1 ${getRarityTextClass(userTradeItem.rarity)}" style="${getRarityStyle(userTradeItem.rarity)}">${userTradeItem.name}</div></div>`;
                comparison.classList.remove('hidden');
            } else {
                userSlot.className = "trading-slot";
                userSlot.innerHTML = `<div class="text-slate-600 text-[10px] font-bold uppercase">CHỌN ĐỒ<br><span class="text-[8px] opacity-50">(Hoặc chỉ nhập tiền)</span></div>`;
                if(uMoney === 0) comparison.classList.add('hidden'); else comparison.classList.remove('hidden');
            }
            userValDisp.innerText = uVal.toLocaleString();

            if (botTradeItem) {
                const bp = botTradeItem.customPrice || botTradeItem.price;
                botSlot.className = `trading-slot active ${getVFXClass(botTradeItem.name)}`;
                botSlot.innerHTML = `<div class="flex flex-col items-center"><div class="text-3xl">${botTradeItem.icon}</div><div class="text-[9px] font-black uppercase mt-1 ${getRarityTextClass(botTradeItem.rarity)}" style="${getRarityStyle(botTradeItem.rarity)}">${botTradeItem.name}</div><div class="text-[8px] text-yellow-500 font-bold">${bp.toLocaleString()}$</div></div>`;
                botValDisp.innerText = bp.toLocaleString();
                
                botWillAccept = false;
                botWillSell = false;
                let reason = "BOT: \"Đang xem xét...\"";
                
                if (botTradeItem.name === "Phóng xạ") {
                    if (userTradeItem && userTradeItem.name === "Quỷ" && uMoney >= 30000000) {
                        botWillAccept = true; reason = "MERCHANT: \"Giao kèo hoàn tất, sức mạnh này là của ngươi!\"";
                    } else if (!userTradeItem && uMoney > 0) {
                        reason = "MERCHANT: \"Thứ này không thể chỉ mua bằng tiền! Ta cần Quỷ và 30,000,000$!\"";
                    } else {
                        reason = "MERCHANT: \"Ta cần Quỷ và 30,000,000$ tiền mặt! Không bớt!\"";
                    }
                } else if (activeBot.type === 'pro' && botTradeItem.rarity === 'GODLY') {
                    if (userTradeItem && RARITIES[userTradeItem.rarity]?.priority >= RARITIES['GODLY'].priority) {
                         if (uVal >= bp) {
                             botWillAccept = true; 
                             if (userTradeItem.rarity === 'GODLY') {
                                 reason = "PRO: \"Godly đổi Godly! Chốt kèo luôn bạn ơi!\"";
                             } else {
                                 reason = `PRO: \"Hàng ${userTradeItem.rarity} đổi Godly à? Lời quá, tôi duyệt!\"`;
                             }
                         } else {
                             let diff = Math.ceil(bp - uVal);
                             reason = `PRO: \"Tuy hàng hiếm đấy nhưng của tôi giá cao hơn xíu, bù thêm ${diff.toLocaleString()}$ tiền mặt nhé!\"`;
                         }
                    } else if (uVal >= bp) {
                         botWillAccept = true; reason = "PRO: \"Nhiều tiền đấy, chốt kèo Godly!\"";
                    } else {
                         let diff = Math.ceil(bp - uVal);
                         reason = `PRO: \"Đổi Godly thì đưa đồ ngon đây, và phải bù thêm đúng ${diff.toLocaleString()}$ tiền mặt!\"`;
                    }
                } else if (!userTradeItem && uMoney > 0) {
                    if (uMoney >= botTradeItem.buyoutPrice) {
                        botWillAccept = true; botWillSell = true;
                        reason = "BOT: \"Người anh em sộp quá! Chốt luôn khỏi cần đồ!\"";
                    } else {
                        let diff = Math.ceil(botTradeItem.buyoutPrice - uMoney);
                        reason = `BOT: \"Muốn mua đứt không cần đồ à? Bù thêm ${diff.toLocaleString()}$ nữa mới đủ giá ${botTradeItem.buyoutPrice.toLocaleString()}$ nhé!\"`;
                    }
                } else if (activeBot.type === 'pro') {
                    if (botTradeItem.rarity === 'GODLY' && bp < 10000000 && userTradeItem?.isPack && userTradeItem?.packType === 'mythicCombo') {
                        botWillAccept = true; reason = "PRO: \"ĐỔI COMBO MYTHIC LẤY GODLY À? TÔI DUYỆT!\"";
                    } else if (userTradeItem && userTradeItem.name === activeBot.wantedItem && uVal >= bp * 0.8) {
                        botWillAccept = true; reason = "PRO: \"ĐÚNG THỨ TÔI CẦN! CHỐT!\"";
                    } else if (uVal >= bp) {
                        botWillAccept = true; reason = "PRO: \"Được, kèo này ngon!\"";
                    } else {
                        let diff = Math.ceil(bp - uVal);
                        reason = `PRO: \"Kèo này chưa đủ giá trị, bơm thêm ${diff.toLocaleString()}$ tiền mặt nữa thì tôi chốt!\"`;
                    }
                } else if (activeBot.type === 'traveler') {
                    if (uVal < bp * activeBot.lossTolerance) {
                        let required = Math.ceil(bp * activeBot.lossTolerance);
                        let diff = Math.ceil(required - uVal);
                        reason = `TRAVELER: \"KHÔNG ĐƯỢC, GIÁ NÀY TÔI LỖ QUÁ! Bù thêm ${diff.toLocaleString()}$ thì được.\"`;
                    }
                    else { botWillAccept = true; reason = "TRAVELER: \"Rất công bằng, chốt nhé!\""; }
                } else if (userTradeItem || uMoney > 0) {
                    if (uVal >= bp) { botWillAccept = true; reason = "BOT: \"ĐƯỢC ĐẤY, CHỐT LUÔN!\""; }
                    else { 
                        let diff = Math.ceil(bp - uVal);
                        reason = `BOT: \"Giá trị của bạn đưa ra chưa đủ! Cần thêm ${diff.toLocaleString()}$.\"`; 
                    }
                }
                
                if (botWillAccept) {
                    btn.disabled = false;
                    btn.className = "mt-4 mb-6 press-effect w-full bg-green-500 text-slate-950 font-black py-5 rounded-2xl transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.4)]";
                    btn.innerText = botWillSell ? "MUA ĐỨT BẰNG TIỀN" : "XÁC NHẬN GIAO DỊCH";
                    msg.innerText = reason; icon.innerText = "✅"; icon.classList.remove('opacity-20');
                } else {
                    btn.disabled = true;
                    btn.className = "mt-4 mb-6 w-full bg-slate-800 text-slate-500 font-black py-5 rounded-2xl uppercase tracking-widest opacity-50";
                    btn.innerText = "XÁC NHẬN GIAO DỊCH";
                    msg.innerText = reason; icon.innerText = "❌";
                }
            }
        };

        window.openTradeChoiceModal = () => {
            if(!botWillAccept) return;
            let uMoney = parseInt(document.getElementById('trade-money-input').value) || 0;
            
            if (botWillSell || (!userTradeItem && uMoney > 0)) {
                executeTrade();
                return;
            }
            
            if (uMoney > 0) {
                document.getElementById('btn-bot-sell-option').classList.add('hidden');
            } else if (userTradeItem) {
                document.getElementById('btn-bot-sell-option').classList.remove('hidden');
                const previewPrice = Math.floor(userTradeItem.price * (1.2 + Math.random() * 0.3));
                document.getElementById('bot-sell-price-preview').innerText = `Nhận ngay +${previewPrice.toLocaleString()}$`;
                window.currentBotBuyPrice = previewPrice;
            }
            document.getElementById('trade-choice-modal').classList.remove('hidden');
        };

        window.executeBotSell = () => {
            if(!userTradeItem) return;
            const idx = inventory.findIndex(i => i.id === userTradeItem.id);
            if(inventory[idx].count > 1) inventory[idx].count -= 1; else inventory.splice(idx, 1);
            
            const earned = window.currentBotBuyPrice; balance += earned;
            
            showNotif(`ĐÃ BÁN CHO BOT: +${earned.toLocaleString()}$`, "💰");
            updateStats(); saveToCloud(); 
            document.getElementById('trade-choice-modal').classList.add('hidden'); closeTradeCenter();
        };

        window.executeTrade = () => {
            if(!botWillAccept) return;
            let uMoney = parseInt(document.getElementById('trade-money-input').value) || 0;
            
            if(balance < uMoney) {
                showNotif("KHÔNG ĐỦ TIỀN MẶT ĐỂ BÙ!", "❌");
                document.getElementById('trade-choice-modal').classList.add('hidden'); return;
            }

            if (userTradeItem) {
                const idx = inventory.findIndex(i => i.id === userTradeItem.id);
                if(inventory[idx].count > 1) inventory[idx].count -= 1; else inventory.splice(idx, 1);
            }
            balance -= uMoney; 
            
            const existingIdx = inventory.findIndex(i => i.name === botTradeItem.name);
            if (existingIdx !== -1) { inventory[existingIdx].count = (inventory[existingIdx].count || 1) + 1; } 
            else {
                inventory.push({ 
                    id: Date.now() + Math.random().toString(36).substr(2, 5), 
                    name: botTradeItem.name, icon: botTradeItem.icon, rarity: botTradeItem.rarity, 
                    price: botTradeItem.price, count: 1, timestamp: new Date().toISOString() 
                });
            }
            showNotif(botWillSell ? `MUA ĐỨT THÀNH CÔNG!` : `GIAO DỊCH THÀNH CÔNG!`, "🤝");
            updateStats(); saveToCloud(); 
            document.getElementById('trade-choice-modal').classList.add('hidden'); closeTradeCenter();
        };

        const rollCard = () => {
            if(isRolling) return;

                rollSound.currentTime = 0; // Đặt lại thời gian về 0 để có thể phát liên tiếp khi click nhanh
            rollSound.play().catch(e => console.warn("Âm thanh chưa sẵn sàng:", e));
            isRolling = true;
            const luckyFactor = skills.lucky ? 0.75 : 1.0; 
            const modifiedPool = ELEMENT_POOL.map(el => ({...el, currentWeight: (['GODLY', 'MYTHIC', 'LEGENDARY', 'MYSTIC', 'ULTIMATE'].includes(el.rarity)) ? el.weight : el.weight * luckyFactor }));
            const totalWeight = modifiedPool.reduce((acc, el) => acc + el.currentWeight, 0);
            let randomNum = Math.random() * totalWeight;
            let selected = modifiedPool[modifiedPool.length - 1];
            for (const el of modifiedPool) { if (randomNum < el.currentWeight) { selected = el; break; } randomNum -= el.currentWeight; }
            if (autoSellSettings.enabled && autoSellSettings.filters.includes(selected.rarity)) {
                let p = selected.price; if(skills.x2Sell) p *= 2; balance += p;
                showNotif(`AUTO SELL: +${p.toLocaleString()}$`, "🤖");
                updateStats(); saveToCloud(); isRolling = false; return;
            }
            const existingIndex = inventory.findIndex(item => item.name === selected.name);
            let rolledItem;
            if (existingIndex !== -1) {
                inventory[existingIndex].count = (inventory[existingIndex].count || 1) + 1; rolledItem = inventory[existingIndex];
            } else {
                rolledItem = { id: Date.now() + Math.random().toString(36).substr(2, 5), name: selected.name, icon: selected.icon, rarity: selected.rarity, price: selected.price, count: 1, timestamp: new Date().toISOString() };
                inventory.push(rolledItem);
            }
            updateStats(); showCongrats(rolledItem, existingIndex !== -1); saveToCloud(); isRolling = false;
        };

        const showCongrats = (item, isDuplicate) => {
            const overlay = document.getElementById('congrats-overlay');
            const card = document.getElementById('congrats-card');
            const statusText = document.getElementById('congrats-status');
            const sparkleLayer = document.getElementById('sparkle-layer');
            const rarityData = RARITIES[item.rarity] || { color: '#ffffff', label: item.rarity };
            
            sparkleLayer.innerHTML = '';
            document.getElementById('congrats-icon').innerText = item.icon;
            document.getElementById('congrats-name').innerText = item.name;
            document.getElementById('congrats-price').innerText = (item.displayPrice || item.price.toLocaleString() + '$');
            
            if (isDuplicate) { statusText.innerText = `X${item.count} - ĐÃ CÓ`; statusText.classList.remove('hidden'); } 
            else { statusText.classList.add('hidden'); }
            
            const rarityTag = document.getElementById('congrats-rarity');
            rarityTag.innerText = rarityData.label; 
            
            if (item.rarity === 'ULTIMATE') {
                rarityTag.className = "rarity-tag inline-block mb-4 text-rainbow";
                rarityTag.style.backgroundColor = 'rgba(255,255,255,0.1)';
            } else {
                rarityTag.className = "rarity-tag inline-block mb-4";
                rarityTag.style.backgroundColor = rarityData.color;
            }

            card.style.borderColor = rarityData.color;
            document.getElementById('card-inner-glow').style.backgroundColor = rarityData.color;
            
            card.className = `bg-slate-900 p-8 rounded-[2.5rem] max-w-sm w-full text-center border-4 transform transition-all scale-50 opacity-0 duration-500 shadow-2xl relative overflow-hidden ${getVFXClass(item.name)}`;

            if (!getVFXClass(item.name)) {
                if (item.rarity === 'GODLY' || item.rarity === 'ULTIMATE') {
                    card.classList.add('rarity-glow-godly');
                    for(let i=0; i<12; i++) {
                        const s = document.createElement('div');
                        s.className = 'sparkle'; s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%';
                        s.style.animationDelay = Math.random() * 2 + 's'; s.style.width = Math.random() * 6 + 2 + 'px'; s.style.height = s.style.width;
                        sparkleLayer.appendChild(s);
                    }
                }
                if (item.rarity === 'MYTHIC') card.classList.add('rarity-glow-mythic');
                if (item.rarity === 'LIMITED') card.classList.add('summer-glow');
            }
            
            overlay.classList.remove('hidden');
            setTimeout(() => { card.classList.remove('scale-50', 'opacity-0'); card.classList.add('scale-100', 'opacity-100'); }, 50);
            if (isAutoOn && item.name !== "VICTORY") { const autoDelay = skills.speedX2 ? 400 : 800; setTimeout(() => { if(!overlay.classList.contains('hidden')) closeCongrats(); }, autoDelay); }
        };

        window.rollCard = rollCard;
        window.closeCongrats = () => { document.getElementById('congrats-card').classList.add('scale-50', 'opacity-0'); setTimeout(() => { document.getElementById('congrats-overlay').classList.add('hidden'); }, 300); };
        window.handleAutoToggle = (checked) => {
            isAutoOn = checked;
            document.getElementById('auto-indicator').classList.toggle('hidden', !isAutoOn);
            if (isAutoOn) {
                if (autoRollInterval) clearInterval(autoRollInterval);
                autoRollInterval = setInterval(() => { if (!isRolling && document.getElementById('congrats-overlay').classList.contains('hidden')) rollCard(); }, skills.speedX2 ? 350 : 700);
            } else { clearInterval(autoRollInterval); autoRollInterval = null; }
        };

        window.sellItem = (mode) => {
            if (!currentSelectedItem) return;
            const idx = inventory.findIndex(i => i.id === currentSelectedItem.id);
            if (idx !== -1) {
                const item = inventory[idx];
                const multi = skills.x2Sell ? 2 : 1;
                if (mode === 1) {
                    balance += item.price * multi;
                    if (item.count > 1) item.count -= 1; else { inventory.splice(idx, 1); closeActionModal(); }
                } else {
                    balance += item.price * (item.count || 1) * multi;
                    inventory.splice(idx, 1); closeActionModal();
                }
                updateStats(); renderInventory(); saveToCloud();
            }
        };

        window.togglePackShop = (show) => document.getElementById('pack-shop-modal').classList.toggle('hidden', !show);
        
        const getGodlyPackItem = () => {
            const godlyWeights = { "Quỷ": 0.00001, "Tinh Tú": 0.0001, "Sáng Thế": 0.1, "Vĩnh Hằng": 30.0, "Hỗn Mang": 70.0 };
            const godlys = ELEMENT_POOL.filter(e => e.rarity === 'GODLY');
            const totalWeight = Object.values(godlyWeights).reduce((a, b) => a + b, 0);
            let rand = Math.random() * totalWeight, selectedName = "Hỗn Mang"; 
            for (const [name, weight] of Object.entries(godlyWeights)) { if (rand < weight) { selectedName = name; break; } rand -= weight; }
            return godlys.find(e => e.name === selectedName);
        };

        window.buyPack = (type, price, openImmediately) => {
            const lastBuy = lastPackBuyTimes[type] || 0;
            const waitTime = PACK_COOLDOWNS[type];
            if (lastBuy > 0 && Date.now() - lastBuy < waitTime) { showNotif("GÓI ĐANG HẾT HÀNG!", "⏳"); return; }
            if (balance < price) { showNotif("CẦN " + price.toLocaleString() + "$", "❌"); return; }
            
            balance -= price; lastPackBuyTimes[type] = Date.now();
            
            if (openImmediately) {
                let itemsToAdd = [];
                if (type === 'mythicCombo') {
                    const mythics = ELEMENT_POOL.filter(e => e.rarity === 'MYTHIC');
                    for(let i=0; i<3; i++) itemsToAdd.push({...mythics[Math.floor(Math.random()*mythics.length)]});
                } else if (type === 'godlySingle') { itemsToAdd.push({...getGodlyPackItem()}); }
                itemsToAdd.forEach(item => {
                    const existingIdx = inventory.findIndex(i => i.name === item.name);
                    if (existingIdx !== -1) inventory[existingIdx].count = (inventory[existingIdx].count || 1) + 1;
                    else inventory.push({id: Date.now()+Math.random(), ...item, count:1});
                });
                showNotif("ĐÃ MỞ PACK THÀNH CÔNG!", "🎁");
            } else {
                const packName = type === 'mythicCombo' ? 'Elemental Pack (Mythic x3)' : 'Elemental Pack (Godly x1)';
                const existingIdx = inventory.findIndex(i => i.name === packName);
                if (existingIdx !== -1) inventory[existingIdx].count = (inventory[existingIdx].count || 1) + 1;
                else { inventory.push({ id: 'pack-'+Date.now(), name: packName, icon: '📦', rarity: 'SPECIAL', price: price, count: 1, isPack: true, packType: type }); }
                showNotif("ĐÃ MUA PACK (DẠNG TRADE)", "📦");
            }
            updateStats(); saveToCloud();
        };
        
        window.buySummerPack = () => {
            const price = 50000000;
            if (inventory.some(i => i.name === 'Summer2026 Limited')) { showNotif("CHỈ ĐƯỢC MUA 1 LẦN!", "❌"); return; }
            if (balance < price) { showNotif("CẦN 50M$", "❌"); return; }
            balance -= price;
            const baseItem = LIMITED_ELEMENTS[0];
            const item = { id: 'summer-'+Date.now(), ...baseItem, count: 1, timestamp: new Date().toISOString() };
            inventory.push(item);
            showCongrats(item, false); updateStats(); saveToCloud();
        };

        window.usePack = () => {
            if(!currentSelectedItem || !currentSelectedItem.isPack) return;
            const type = currentSelectedItem.packType;
            const idx = inventory.findIndex(i => i.id === currentSelectedItem.id);
            if(inventory[idx].count > 1) inventory[idx].count -= 1; else inventory.splice(idx, 1);
            let itemsToAdd = [];
            if (type === 'mythicCombo') {
                const mythics = ELEMENT_POOL.filter(e => e.rarity === 'MYTHIC');
                for(let i=0; i<3; i++) itemsToAdd.push({...mythics[Math.floor(Math.random()*mythics.length)]});
            } else if (type === 'godlySingle') { itemsToAdd.push({...getGodlyPackItem()}); }
            itemsToAdd.forEach(item => {
                const exIdx = inventory.findIndex(i => i.name === item.name);
                if (exIdx !== -1) inventory[exIdx].count = (inventory[exIdx].count || 1) + 1;
                else inventory.push({id: Date.now()+Math.random(), ...item, count:1});
            });
            closeActionModal(); updateStats(); renderInventory(); saveToCloud(); showNotif("MỞ PACK THÀNH CÔNG!", "🎁");
        };

        window.buySkill = (skillKey, price) => {
            if (balance < price) { showNotif("CẦN " + price.toLocaleString() + "$", "❌"); return; }
            balance -= price; skills[skillKey] = true; updateStats(); saveToCloud(); showNotif("MUA THÀNH CÔNG!", "✅");
        };

        window.handleRedeem = () => {
            const input = document.getElementById('input-redeem'); const code = input.value.trim().toUpperCase();
            if (code === "ADAD") { document.getElementById('admin-modal').classList.remove('hidden'); showNotif("ADMIN AUTHORIZED", "🔒"); input.value = ""; return; }
            if (usedCodes.includes(code)) { showNotif("Mã đã dùng!", "❌"); return; }
            if (code === "SUMMER2026") { balance += 1500000; usedCodes.push(code); showNotif("+1.5M", "💸"); }
            else { showNotif("Mã không hợp lệ!", "⚠️"); }
            updateStats(); saveToCloud(); input.value = "";
        };

        window.toggleShop = (show) => { document.getElementById('shop-modal').classList.toggle('hidden', !show); if(show) renderDealerShop(); };
        window.toggleInventory = (show) => { document.getElementById('inventory-modal').classList.toggle('hidden', !show); if(show) { currentPage = 1; renderInventory(); } };
        window.toggleCollection = (show) => { document.getElementById('collection-modal').classList.toggle('hidden', !show); if(show) renderCollection(); };
        window.changePage = (dir) => { const maxPage = 10; if(currentPage + dir >= 1 && currentPage + dir <= maxPage) { currentPage += dir; renderInventory(); } };
        window.closeActionModal = () => document.getElementById('action-modal').classList.add('hidden');
        window.showItemCode = () => { document.getElementById('display-code').innerText = `#${Math.random().toString(36).substr(2, 5).toUpperCase()}`; document.getElementById('code-box').classList.remove('hidden'); };

        const renderInventory = () => {
            const grid = document.getElementById('inventory-grid'); grid.innerHTML = '';
            document.getElementById('current-page-text').innerText = `Trang ${currentPage}`;
            const sorted = [...inventory].sort((a,b) => (RARITIES[b.rarity]?.priority || 0) - (RARITIES[a.rarity]?.priority || 0));
            sorted.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).forEach(item => {
                const card = document.createElement('div');
                card.className = `relative card-shimmer bg-slate-900 border-2 p-4 rounded-3xl flex flex-col items-center text-center press-effect h-full min-h-[160px] ${getVFXClass(item.name)}`;
                
                if(!getVFXClass(item.name)) {
                    if (item.rarity === 'GODLY') card.classList.add('rarity-glow-godly');
                    else if (item.rarity === 'LIMITED') card.classList.add('summer-glow');
                    else card.style.borderColor = (RARITIES[item.rarity]?.color || '#334155') + '33';
                }
                
                card.onclick = () => {
                    currentSelectedItem = item;
                    document.getElementById('action-title').innerText = item.name;
                    document.getElementById('action-icon').innerText = item.icon;
                    document.getElementById('action-desc').innerText = `Loại: ${item.rarity}. x${item.count}. Giá: ${item.displayPrice || item.price.toLocaleString() + '$'}`;
                    
                    document.getElementById('btn-sell-one').classList.toggle('hidden', ((item.count || 1) <= 1) || item.isLimited);
                    document.getElementById('btn-use-pack').classList.toggle('hidden', !item.isPack);
                    document.getElementById('btn-sell-item').classList.toggle('hidden', !!item.isPack || !!item.isLimited);
                    
                    document.getElementById('btn-gen-code').classList.toggle('hidden', !!item.isLimited);
                    document.getElementById('code-box').classList.add('hidden');
                    document.getElementById('action-modal').classList.remove('hidden');
                };
                card.innerHTML = `${item.count > 1 ? `<div class="stack-badge">x${item.count}</div>`:''}<div class="text-4xl mb-3 mt-2">${item.icon}</div><div class="rarity-tag mb-1 ${getRarityTextClass(item.rarity)}" style="${getRarityStyle(item.rarity)}">${item.rarity}</div><div class="text-xs font-black truncate w-full uppercase">${item.name}</div><div class="mt-auto text-[10px] text-green-500 font-bold">${item.displayPrice || item.price.toLocaleString() + '$'}</div>`;
                grid.appendChild(card);
            });
        };

        const renderCollection = () => {
            const grid = document.getElementById('collection-grid'); grid.innerHTML = '';
            const owned = new Set(inventory.map(i => i.name));
            
            const categories = [{ title: "LEGACY ELEMENTS", pool: ELEMENT_POOL }, { title: "LIMITED ELEMENTAL", pool: LIMITED_ELEMENTS }];
            
            categories.forEach(cat => {
                const title = document.createElement('h3'); title.className = "col-span-full text-[10px] font-black tracking-widest text-slate-500 uppercase mt-4 mb-2 pl-2"; title.innerText = cat.title; grid.appendChild(title);
                
                cat.pool.forEach(el => {
                    const isOwned = owned.has(el.name);
                    const card = document.createElement('div');
                    
                    // Không dùng CSS class .locked-item nữa để viền không bị mất màu
                    card.className = `relative bg-slate-900 border-2 p-3 rounded-2xl flex flex-col items-center text-center ${isOwned ? getVFXClass(el.name) : 'opacity-70'}`;
                    
                    // Cấp viền màu tương ứng với độ hiếm (có giảm độ đậm đi một nửa nếu chưa sở hữu bằng cách thêm '66' hoặc '33' hex alpha)
                    card.style.borderColor = RARITIES[el.rarity].color + (isOwned ? '66' : '33');
                    
                    card.innerHTML = `
                        <div class="text-3xl mb-2 ${isOwned ? '' : 'grayscale brightness-50'}">${isOwned ? el.icon : '❓'}</div>
                        <div class="text-[9px] font-black uppercase mb-1 ${getRarityTextClass(el.rarity)} ${isOwned ? '' : 'opacity-60'}" style="${getRarityStyle(el.rarity)}">${el.rarity}</div>
                        <div class="text-[10px] font-bold truncate w-full text-slate-400 uppercase ${isOwned ? '' : 'opacity-40'}">${isOwned ? el.name : '?? ??'}</div>
                    `;
                    grid.appendChild(card);
                });
            });
        };

        // ==========================================
        //         TOWER DEFENSE LOGIC
        // ==========================================
        let tdGameLoop; let tdActive = false; let tdCanvas, tdCtx;
        let tdHp = 100, tdMaxHp = 100, tdWave = 1, tdMaxWave = 20, tdMoney = 50;
        let tdEnemies = [], tdTowers = [], tdProjectiles = [], tdParticles = [], enemiesToSpawn = 0, spawnTimer = 0, waveActive = false;

        const TD_CELL = 50, TD_COLS = 16, TD_ROWS = 12;
        const tdPathPoints = [
            {x: 0, y: 3}, {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3}, {x: 9, y: 3}, {x: 10, y: 3}, {x: 11, y: 3}, {x: 12, y: 3},
            {x: 12, y: 4}, {x: 12, y: 5}, {x: 12, y: 6}, {x: 12, y: 7}, {x: 12, y: 8},
            {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8}, {x: 8, y: 8}, {x: 7, y: 8}, {x: 6, y: 8}, {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8},
            {x: 3, y: 9}, {x: 3, y: 10}, 
            {x: 4, y: 10}, {x: 5, y: 10}, {x: 6, y: 10}, {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10}, {x: 10, y: 10}, {x: 11, y: 10}, {x: 12, y: 10}, {x: 13, y: 10}, {x: 14, y: 10}, {x: 15, y: 10}, {x: 16, y: 10}
        ];
        let selectedTDItem = null, activeTowerToUpgrade = null;

        window.openTD = () => { document.getElementById('td-modal').classList.remove('hidden'); tdCanvas = document.getElementById('td-canvas'); tdCtx = tdCanvas.getContext('2d'); tdActive = true; resetTDGame(); renderTDShop(); tdGameLoop = requestAnimationFrame(updateTDGame); };
        window.closeTD = () => { tdActive = false; cancelAnimationFrame(tdGameLoop); document.getElementById('td-modal').classList.add('hidden'); };

        const resetTDGame = () => {
            tdHp = 100; tdWave = 1; tdMoney = 100; tdEnemies = []; tdTowers = []; tdProjectiles = []; tdParticles = []; waveActive = false; updateTDUI();
            selectedTDItem = null; activeTowerToUpgrade = null; document.getElementById('td-upgrade-panel').classList.add('hidden');
            document.getElementById('td-btn-startwave').innerText = "GỌI QUÁI (WAVE 1)"; document.getElementById('td-btn-startwave').disabled = false;
        };

        const updateTDUI = () => {
            document.getElementById('td-hp-text').innerText = `${tdHp}/${tdMaxHp}`;
            document.getElementById('td-hp-bar').style.width = `${Math.max(0, (tdHp/tdMaxHp)*100)}%`;
            document.getElementById('td-wave-text').innerHTML = `WAVE ${tdWave}<span class="text-sm text-slate-500">/${tdMaxWave}</span>`;
            document.getElementById('td-money-text').innerText = tdMoney;
        };

        const renderTDShop = () => {
            const list = document.getElementById('td-shop-list'); list.innerHTML = '';
            const uniqueOwned = [], seen = new Set();
            inventory.forEach(item => { if(!item.isPack && !seen.has(item.name)) { seen.add(item.name); uniqueOwned.push(item); } });

            if(uniqueOwned.length === 0) { list.innerHTML = `<div class="text-center text-slate-500 text-xs mt-4">Bạn chưa sở hữu nguyên tố nào. Hãy quay hòm để nhận!</div>`; return; }

            uniqueOwned.sort((a,b) => (RARITIES[b.rarity]?.priority || 0) - (RARITIES[a.rarity]?.priority || 0));

            uniqueOwned.forEach(item => {
                const stats = TD_STATS[item.rarity] || TD_STATS.BASIC;
                const div = document.createElement('div');
                div.className = `td-shop-item bg-slate-800 rounded-xl p-2 flex items-center justify-between gap-2 ${getVFXClass(item.name)}`;
                div.innerHTML = `
                    <div class="flex items-center gap-2">
                        <div class="text-2xl">${item.icon}</div>
                        <div class="flex flex-col">
                            <span class="text-[9px] font-black uppercase ${getRarityTextClass(item.rarity)}" style="${getRarityStyle(item.rarity)}">${item.name}</span>
                            <span class="text-[8px] text-slate-400">${item.isLimited ? "Buff Tiền/Wave" : `DMG: ${stats.dmg} | TẦM: ${stats.range}`}</span>
                        </div>
                    </div>
                    <div class="text-xs font-black text-yellow-500">${stats.cost}$</div>
                `;
                div.onclick = () => {
                    closeUpgradePanel();
                    if(tdMoney < stats.cost) { showNotif("KHÔNG ĐỦ TIỀN", "❌"); return; }
                    document.querySelectorAll('.td-shop-item').forEach(el => el.classList.remove('selected')); div.classList.add('selected'); selectedTDItem = { ...item, ...stats };
                };
                list.appendChild(div);
            });
        };

        window.closeUpgradePanel = () => { activeTowerToUpgrade = null; document.getElementById('td-upgrade-panel').classList.add('hidden'); };

        const openUpgradePanel = (tower) => {
            selectedTDItem = null; document.querySelectorAll('.td-shop-item').forEach(el => el.classList.remove('selected')); activeTowerToUpgrade = tower;
            const panel = document.getElementById('td-upgrade-panel'); panel.classList.remove('hidden');
            
            document.getElementById('td-upg-icon').innerText = tower.icon;
            const nameEl = document.getElementById('td-upg-name');
            nameEl.innerText = tower.name;
            nameEl.className = `text-xs font-black uppercase ${getRarityTextClass(tower.rarity)}`;
            nameEl.style = getRarityStyle(tower.rarity);
            
            document.getElementById('td-upg-level').innerText = `Cấp: ${tower.level}/3`;
            
            if (tower.isLimited) {
                document.getElementById('td-upg-stat-1').innerHTML = `Buff: <span class="text-green-400">+${200 + tower.level * 100}$/Wave</span>`; document.getElementById('td-upg-stat-2').innerHTML = "";
            } else {
                document.getElementById('td-upg-stat-1').innerHTML = `Sát thương: <span id="td-upg-dmg" class="text-white">${tower.dmg.toFixed(0)}</span>`; document.getElementById('td-upg-stat-2').innerHTML = `Tầm đánh: <span id="td-upg-range" class="text-white">${tower.range.toFixed(0)}</span>`;
            }
            
            const btn = document.getElementById('btn-td-upgrade');
            if(tower.level >= 3) {
                btn.disabled = true; btn.className = "w-2/3 py-2 bg-slate-700 text-slate-400 font-black rounded-lg uppercase text-[10px] text-center"; btn.innerHTML = "MAX CẤP";
            } else {
                btn.disabled = false; btn.className = "w-2/3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-black rounded-lg uppercase text-[10px] press-effect shadow-lg flex justify-between px-3"; btn.innerHTML = `<span>NÂNG CẤP</span><span id="td-upg-cost">${getUpgradeCost(tower)}$</span>`;
            }
        };

        const getUpgradeCost = (tower) => {
            const baseCost = TD_STATS[tower.rarity].cost;
            if(tower.level === 0) return Math.floor(baseCost * 1.5); if(tower.level === 1) return Math.floor(baseCost * 2.5); if(tower.level === 2) return Math.floor(baseCost * 4.0); return 0;
        };

        window.sellSelectedTower = () => {
            if(!activeTowerToUpgrade) return;
            const baseCost = TD_STATS[activeTowerToUpgrade.rarity].cost; let cost = baseCost;
            if(activeTowerToUpgrade.level >= 1) cost += Math.floor(baseCost * 1.5); if(activeTowerToUpgrade.level >= 2) cost += Math.floor(baseCost * 2.5); if(activeTowerToUpgrade.level >= 3) cost += Math.floor(baseCost * 4.0);
            const refund = Math.floor(cost * 0.5); tdMoney += refund; tdTowers = tdTowers.filter(t => t !== activeTowerToUpgrade);
            updateTDUI(); closeUpgradePanel(); showNotif(`ĐÃ BÁN THÁP (+${refund}$)`, "💰");
        };

        window.upgradeSelectedTower = () => {
            if(!activeTowerToUpgrade || activeTowerToUpgrade.level >= 3) return;
            const cost = getUpgradeCost(activeTowerToUpgrade);
            if(tdMoney >= cost) {
                tdMoney -= cost; activeTowerToUpgrade.level++; activeTowerToUpgrade.dmg *= 1.5; activeTowerToUpgrade.range *= 1.2;
                updateTDUI(); openUpgradePanel(activeTowerToUpgrade); showNotif("ĐÃ NÂNG CẤP THÁP", "⭐");
            } else showNotif("KHÔNG ĐỦ TIỀN", "❌");
        };

        document.getElementById('td-canvas').addEventListener('click', (e) => {
            if(!tdActive) return;
            const rect = tdCanvas.getBoundingClientRect(), scaleX = tdCanvas.width / rect.width, scaleY = tdCanvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX, y = (e.clientY - rect.top) * scaleY;
            const gridX = Math.floor(x / TD_CELL), gridY = Math.floor(y / TD_CELL);

            const clickedTower = tdTowers.find(t => t.gridX === gridX && t.gridY === gridY);
            if(clickedTower) { openUpgradePanel(clickedTower); return; }
            if(!selectedTDItem) return;
            if(tdPathPoints.some(p => p.x === gridX && p.y === gridY)) { showNotif("KHÔNG ĐƯỢC XÂY TRÊN ĐƯỜNG", "⚠️"); return; }

            if(tdMoney >= selectedTDItem.cost) {
                tdMoney -= selectedTDItem.cost;
                tdTowers.push({ gridX, gridY, x: gridX * TD_CELL + TD_CELL/2, y: gridY * TD_CELL + TD_CELL/2, ...selectedTDItem, level: 0, cooldownTimer: 0, frozenTimer: 0 });
                updateTDUI(); renderTDShop(); 
            } else showNotif("KHÔNG ĐỦ TIỀN TRONG TRẬN", "❌");
        });

        window.startTDWave = () => {
            if(waveActive) return;
            waveActive = true;
            enemiesToSpawn = (tdWave === 10 || tdWave === 20) ? 1 : (5 + tdWave * 2); 
            document.getElementById('td-btn-startwave').disabled = true; document.getElementById('td-btn-startwave').innerText = "ĐANG THỦ CHUẨN BỊ...";
        };

        const updateTDGame = () => {
            if(!tdActive) return;

            if(waveActive && enemiesToSpawn > 0) {
                spawnTimer++;
                if(spawnTimer > 40 - Math.min(tdWave, 20)) { 
                    if (tdWave === 20) {
                        tdEnemies.push({ x: tdPathPoints[0].x * TD_CELL + TD_CELL/2, y: tdPathPoints[0].y * TD_CELL + TD_CELL/2, pathIdx: 0, hp: 5000000, maxHp: 5000000, speed: 0.4, reward: 100000, isBoss: true, freezeCooldown: 0, color: '#ef4444', radius: 25, isFinalBoss: true });
                    } else if (tdWave === 10) {
                        let bossHp = inventory.some(i => i.rarity === 'GODLY' || i.rarity === 'MYTHIC' || i.rarity === 'LIMITED' || i.rarity === 'ULTIMATE') ? 500000 : 20000;
                        tdEnemies.push({ x: tdPathPoints[0].x * TD_CELL + TD_CELL/2, y: tdPathPoints[0].y * TD_CELL + TD_CELL/2, pathIdx: 0, hp: bossHp, maxHp: bossHp, speed: 0.6, reward: 5000, isBoss: true, freezeCooldown: 0, color: '#eab308', radius: 20 });
                    } else {
                        let baseHp = 20 + tdWave * 15 + Math.pow(tdWave, 2) * 5;
                        tdEnemies.push({ x: tdPathPoints[0].x * TD_CELL + TD_CELL/2, y: tdPathPoints[0].y * TD_CELL + TD_CELL/2, pathIdx: 0, hp: baseHp, maxHp: baseHp, speed: 1.5 + (tdWave * 0.05), reward: 100, isBoss: false, color: '#ef4444', radius: 10, poisoned: 0, poisonDmg: 0 });
                    }
                    enemiesToSpawn--; spawnTimer = 0;
                }
            }

            for (let i = tdEnemies.length - 1; i >= 0; i--) {
                let e = tdEnemies[i];

                // Logic Đóng băng của Boss
                if (e.isBoss) {
                    e.freezeCooldown += 1;
                    let threshold = e.isFinalBoss ? 720 : 600; // Final boss 12s, normal boss 10s
                    if (e.freezeCooldown >= threshold) {
                        e.freezeCooldown = 0; 
                        showNotif(e.isFinalBoss ? "TRÙM CUỐI ĐÓNG BĂNG MỌI THÁP TRONG 5S!" : "BOSS ĐÓNG BĂNG THÁP!", "❄️"); 
                        tdTowers.forEach(t => t.frozenTimer = 300); // Đóng băng 5s
                    }
                }

                // Logic Poison
                if (e.poisoned && e.poisoned > 0) {
                    e.poisoned--;
                    if (e.poisoned % 30 === 0) {
                        e.hp -= e.poisonDmg;
                        tdParticles.push({x: e.x, y: e.y, vx: (Math.random()-0.5)*2, vy: -Math.random()*2, life: 15, color: '#22c55e'});
                    }
                    if (e.hp <= 0) {
                        tdMoney += e.reward; tdEnemies.splice(i, 1); updateTDUI();
                        continue;
                    }
                }

                if(e.pathIdx < tdPathPoints.length - 1) {
                    let targetPoint = tdPathPoints[e.pathIdx + 1], tx = targetPoint.x * TD_CELL + TD_CELL/2, ty = targetPoint.y * TD_CELL + TD_CELL/2, dx = tx - e.x, dy = ty - e.y, dist = Math.hypot(dx, dy);
                    if(dist < e.speed) { e.x = tx; e.y = ty; e.pathIdx++; } else { e.x += (dx/dist) * e.speed; e.y += (dy/dist) * e.speed; }
                } else {
                    tdHp -= e.isBoss ? (e.isFinalBoss ? 100 : 50) : 5; tdEnemies.splice(i, 1); updateTDUI();
                    if(tdHp <= 0) { alert("THÀNH ĐÃ BỊ PHÁ HỦY! GAME OVER."); closeTD(); return; }
                }
            }

            // Particle update
            for(let i=tdParticles.length-1; i>=0; i--) {
                let pt = tdParticles[i];
                pt.x += pt.vx; pt.y += pt.vy; pt.life--;
                if(pt.life <= 0) tdParticles.splice(i, 1);
            }

            tdTowers.forEach(t => {
                if (t.frozenTimer > 0) { t.frozenTimer--; return; }
                if (t.name === "Summer2026 Limited") return;

                if(t.cooldownTimer > 0) t.cooldownTimer--;
                else {
                    let target = null, minDist = t.range;
                    tdEnemies.forEach(e => { let dist = Math.hypot(t.x - e.x, t.y - e.y); if(dist <= minDist) { minDist = dist; target = e; } });

                    if(target) {
                        let isAcid = (t.name === "Phóng xạ" && t.level >= 2);
                        if (t.name === "Quỷ" && t.level >= 3) {
                            for(let i=0; i<5; i++) tdProjectiles.push({ x: t.x + (Math.random()*20-10), y: t.y + (Math.random()*20-10), target: target, dmg: t.dmg * 0.4, speed: 4 + Math.random()*2, color: '#a855f7', isMinion: true, wobble: Math.random() * Math.PI * 2 });
                        } else {
                            tdProjectiles.push({ x: t.x, y: t.y, target: target, dmg: t.dmg, speed: 8, color: isAcid ? '#22c55e' : (t.name === "Quỷ" ? '#a855f7' : RARITIES[t.rarity].color), isMinion: false, isAcid: isAcid });
                        }
                        t.cooldownTimer = t.cd;
                    }
                }
            });

            for (let i = tdProjectiles.length - 1; i >= 0; i--) {
                let p = tdProjectiles[i];
                if(!tdEnemies.includes(p.target)) {
                    if (p.isMinion) {
                        let newTarget = null, minDist = 150;
                        tdEnemies.forEach(e => { let dist = Math.hypot(p.x - e.x, p.y - e.y); if(dist <= minDist) { minDist = dist; newTarget = e; } });
                        if(newTarget) p.target = newTarget; else { tdProjectiles.splice(i, 1); continue; }
                    } else { tdProjectiles.splice(i, 1); continue; }
                }
                
                let dx = p.target.x - p.x, dy = p.target.y - p.y, dist = Math.hypot(dx, dy);
                if(dist < p.speed) {
                    p.target.hp -= p.dmg;
                    
                    if (p.isAcid) {
                        // Splash Damage 5 targets
                        let splashed = 0;
                        tdEnemies.forEach(e => {
                            if (e !== p.target && splashed < 5 && Math.hypot(e.x - p.target.x, e.y - p.target.y) < 120) {
                                e.hp -= p.dmg * 0.5;
                                e.poisoned = 300; e.poisonDmg = p.dmg * 0.1;
                                splashed++;
                            }
                        });
                        if (p.target.hp > 0) {
                            p.target.poisoned = 300; p.target.poisonDmg = p.dmg * 0.1;
                        }
                        // Acid particles
                        for(let k=0; k<10; k++) {
                            tdParticles.push({x: p.x, y: p.y, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, life: 30, color: '#22c55e'});
                        }
                    }

                    if(p.target.hp <= 0) { tdMoney += p.target.reward; tdEnemies.splice(tdEnemies.indexOf(p.target), 1); updateTDUI(); }
                    tdProjectiles.splice(i, 1);
                } else {
                    if (p.isMinion) { p.wobble += 0.2; p.x += (dx/dist) * p.speed + Math.cos(p.wobble) * 2; p.y += (dy/dist) * p.speed + Math.sin(p.wobble) * 2; } 
                    else { p.x += (dx/dist) * p.speed; p.y += (dy/dist) * p.speed; }
                }
            }

            if(waveActive && enemiesToSpawn === 0 && tdEnemies.length === 0) {
                waveActive = false;
                let summerTotalBuff = 0;
                tdTowers.forEach(t => { if (t.name === "Summer2026 Limited") summerTotalBuff += (200 + t.level * 100); });
                if (summerTotalBuff > 0) { tdMoney += summerTotalBuff; showNotif(`BUFF MÙA HÈ: +${summerTotalBuff}$`, "🏝️"); }

                if(tdWave === tdMaxWave) {
                    balance += 5000000; 
                    tdWins++; // Tăng lượt thắng
                    updateStats(); saveToCloud(); closeTD();
                    showCongrats({ name: "THẮNG THỦ THÀNH", icon: "🏆", displayPrice: "+5,000,000$", rarity: "GODLY", count: 1 }, false);
                    return;
                }
                tdWave++; updateTDUI();
                document.getElementById('td-btn-startwave').disabled = false; document.getElementById('td-btn-startwave').innerText = `GỌI QUÁI (WAVE ${tdWave})`;
            }
            drawTDGame(); tdGameLoop = requestAnimationFrame(updateTDGame);
        };

        const drawTDGame = () => {
            tdCtx.clearRect(0, 0, tdCanvas.width, tdCanvas.height);
            tdCtx.fillStyle = '#1e293b'; tdPathPoints.forEach(p => tdCtx.fillRect(p.x * TD_CELL, p.y * TD_CELL, TD_CELL, TD_CELL));
            tdCtx.strokeStyle = '#334155'; tdCtx.lineWidth = 1; tdPathPoints.forEach(p => tdCtx.strokeRect(p.x * TD_CELL, p.y * TD_CELL, TD_CELL, TD_CELL));

            let lastP = tdPathPoints[tdPathPoints.length-1];
            tdCtx.fillStyle = '#ef4444'; tdCtx.font = "30px Arial"; tdCtx.textAlign = "center"; tdCtx.textBaseline = "middle"; tdCtx.fillText("🏰", lastP.x * TD_CELL + TD_CELL/2, lastP.y * TD_CELL + TD_CELL/2);

            tdCtx.font = "24px Arial";
            tdTowers.forEach(t => {
                tdCtx.fillStyle = '#0f172a'; tdCtx.beginPath(); tdCtx.arc(t.x, t.y, TD_CELL/2 - 2, 0, Math.PI*2); tdCtx.fill();
                tdCtx.strokeStyle = RARITIES[t.rarity].color; tdCtx.lineWidth = 2; tdCtx.stroke();
                
                if(selectedTDItem && selectedTDItem.name === t.name) { tdCtx.beginPath(); tdCtx.arc(t.x, t.y, t.range, 0, Math.PI*2); tdCtx.fillStyle = RARITIES[t.rarity].color + '11'; tdCtx.fill(); }
                if(activeTowerToUpgrade === t) { tdCtx.beginPath(); tdCtx.arc(t.x, t.y, t.range, 0, Math.PI*2); tdCtx.strokeStyle = '#eab308'; tdCtx.lineWidth = 1; tdCtx.stroke(); }
                tdCtx.fillText(t.icon, t.x, t.y + 2);

                if(t.level > 0) { tdCtx.fillStyle = '#eab308'; tdCtx.font = "10px Arial"; tdCtx.fillText("⭐".repeat(t.level), t.x, t.y - 15); tdCtx.font = "24px Arial"; }
                if (t.frozenTimer > 0) { tdCtx.fillStyle = 'rgba(167, 243, 208, 0.6)'; tdCtx.fillRect(t.x - TD_CELL/2, t.y - TD_CELL/2, TD_CELL, TD_CELL); }
            });

            tdEnemies.forEach(e => {
                tdCtx.beginPath(); tdCtx.arc(e.x, e.y, e.radius, 0, Math.PI*2); tdCtx.fillStyle = (e.poisoned && e.poisoned > 0) ? '#22c55e' : e.color; tdCtx.fill();
                tdCtx.lineWidth = e.isBoss ? 4 : 2; tdCtx.strokeStyle = e.freezeCooldown >= (e.isFinalBoss ? 650 : 550) ? '#38bdf8' : '#fff'; tdCtx.stroke();
                if (e.isBoss) { tdCtx.fillStyle = '#000'; tdCtx.font = "20px Arial"; tdCtx.fillText(e.isFinalBoss ? "💀" : "👹", e.x, e.y); }
                let barW = e.isBoss ? 40 : 20, barH = e.isBoss ? 6 : 4, offsetY = e.isBoss ? 30 : 18;
                tdCtx.fillStyle = '#000'; tdCtx.fillRect(e.x - barW/2, e.y - offsetY, barW, barH);
                tdCtx.fillStyle = '#22c55e'; tdCtx.fillRect(e.x - barW/2, e.y - offsetY, barW * (e.hp/e.maxHp), barH);
            });

            tdProjectiles.forEach(p => {
                tdCtx.fillStyle = p.color;
                if (p.isMinion) {
                    tdCtx.fillRect(p.x - 4, p.y - 4, 8, 8); tdCtx.fillStyle = '#fff'; tdCtx.fillRect(p.x - 2, p.y - 2, 2, 2); tdCtx.fillRect(p.x + 1, p.y - 2, 2, 2);
                } else {
                    tdCtx.beginPath(); tdCtx.arc(p.x, p.y, p.isAcid ? 6 : 4, 0, Math.PI*2); tdCtx.fill(); tdCtx.shadowBlur = 10; tdCtx.shadowColor = p.color; tdCtx.fill(); tdCtx.shadowBlur = 0;
                }
            });

            tdParticles.forEach(pt => {
                tdCtx.fillStyle = pt.color;
                tdCtx.globalAlpha = pt.life / 30;
                tdCtx.beginPath(); tdCtx.arc(pt.x, pt.y, 2, 0, Math.PI*2); tdCtx.fill();
                tdCtx.globalAlpha = 1;
            });
        };

        const initGame = async () => {
            const bar = document.getElementById('loading-bar');
            let p = 0; 
            const int = setInterval(() => { p += 2; if(p > 98) p = 98; bar.style.width = p + "%"; }, 50);

            const setupUser = async (user) => {
                currentUser = user;
                document.getElementById('user-id-display').innerText = `UID: ${user.uid}`;
                
                let cloudData = null;
                if (isUsingFirebase) {
                    try {
                        const snap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'gameData'));
                        if(snap.exists()) cloudData = snap.data();
                    } catch (e) { console.error("Cloud fetch error", e); }
                } else {
                    const savedLocal = localStorage.getItem('legacy_collection_save_v2');
                    if(savedLocal) { try { cloudData = JSON.parse(savedLocal); } catch(e) {} }
                }

                if(cloudData) {
                    inventory = cloudData.inventory || []; skills = {...skills, ...(cloudData.skills || {})}; balance = cloudData.balance || 0;
                    usedCodes = cloudData.usedCodes || []; autoSellSettings = cloudData.autoSellSettings || {enabled:false, filters:[]};
                    lastPackBuyTimes = cloudData.lastPackBuyTimes || { mythicCombo: 0, godlySingle: 0 };
                    tdWins = cloudData.tdWins || 0; // Tải dữ liệu lượt thắng
                    if(cloudData.dealerShopData) dealerShopData = cloudData.dealerShopData;
                }

                if(Date.now() > dealerShopData.nextRestock) generateDealerItems();

                updateStats();
                document.getElementById('btn-roll').disabled = false;
                clearInterval(int); bar.style.width = "100%";
                setTimeout(() => { 
                    document.getElementById('loading-screen').classList.add('hidden'); 
                    document.getElementById('main-menu').classList.remove('hidden'); 
                    showNotif("CHÀO MỪNG ĐẾN VỚI DEV STUDIO GAME", "👋"); 
                }, 500);
            };

            if (isUsingFirebase) {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
                else await signInAnonymously(auth);
                onAuthStateChanged(auth, (u) => { if(u) setupUser(u); });
            } else {
                setTimeout(() => {
                    let localUid = localStorage.getItem('legacy_local_uid');
                    if (!localUid) { localUid = 'LOCAL-' + Math.random().toString(36).substr(2, 9).toUpperCase(); localStorage.setItem('legacy_local_uid', localUid); }
                    setupUser({ uid: localUid });
                }, 600);
            }
        };

        window.onload = initGame;
