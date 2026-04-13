import { useState, useEffect, useCallback } from "react";

// ─── Default DB (fallback if storage empty) ───────────────────────────────────
const DEFAULT_DB = {
  VWRA: { name:"Vanguard FTSE All-World Acc · LSE/USD", type:"ETF", price:"~$115", verdict:"green", label:"Suitable", score:97, layer:"Core ETF Foundation", headline:"Lily's primary engine — the entire world in one accumulating, tax-efficient wrapper.", strengths:["Irish-domiciled UCITS — no US 30% withholding tax event","Accumulating class — dividends silently reinvested, zero taxable distribution","5,000+ companies across 50 countries, 0.22% TER"], concerns:["~65% US weight — a decade of US underperformance would drag the fund","USD-denominated — minor FX consideration if Lily ever needs EUR or AED"], tax:"Irish UCITS accumulating. No dividend is ever paid out, so there is no withholding tax event for Lily under French or Lebanese rules. This is the structurally optimal wrapper for her situation. Chose VWRA over VOO precisely for this reason.", rate:9, teach:"Picture a single ticket that buys you a tiny slice of every major company in the world — Apple, LVMH, Toyota, Samsung, Nestlé — all at once. Every time those companies earn money, your slice quietly grows. Because it 'accumulates', dividends are reinvested automatically without you paying any tax. This is the engine the whole portfolio runs on.", watch:"Annual TER — currently 0.22%. If Vanguard raises it above 0.30%, reassess", sell:"If Vanguard moves domicile away from Ireland or converts to distributing class", go:"yes", action:"Buy regularly and never stop. This is the core of the portfolio." },
  VWCE: { name:"Vanguard FTSE All-World Acc · Xetra/EUR", type:"ETF", price:"~€115", verdict:"green", label:"Suitable", score:95, layer:"Core ETF Foundation", headline:"Identical fund to VWRA — use one or the other, never both.", strengths:["Same underlying portfolio as VWRA — same 5,000+ holdings, same 0.22% TER","EUR listing on Xetra may suit if IBKR account is EUR-denominated","Irish accumulating — same optimal tax structure"], concerns:["VWRA and VWCE are the same fund — holding both is redundancy, not diversification","Pick one currency listing and stay consistent"], tax:"Identical to VWRA. Irish UCITS accumulating. No distribution, no withholding event. EUR denomination does not change the underlying Irish tax structure.", rate:9, teach:"VWCE and VWRA are identical twins — same fund, same companies inside, same fees. One trades in dollars in London, one in euros in Germany. If IBKR shows prices in EUR, VWCE is more readable. If USD, use VWRA. Either works. Never buy both — it's the same thing twice.", watch:"Same as VWRA — they share the same fund structure", sell:"Same as VWRA — domicile or class change", go:"conditional", action:"Use if EUR is preferred over USD. Do not hold alongside VWRA." },
  VHYL: { name:"Vanguard FTSE All-World High Div Yield", type:"ETF", price:"~$68", verdict:"orange", label:"Conditional", score:52, layer:"Core ETF Foundation", headline:"Irish-domiciled but distributing — dividends create annual taxable events for Lily.", strengths:["Irish-domiciled — passes the domicile test","Dividend-focused stocks tend to be mature, stable businesses","3–4% yield if income is eventually needed"], concerns:["DISTRIBUTING class — every dividend payout is a potential taxable event under French rules","Most high-dividend stocks are already inside VWRA — overlap is high","Income advantage is partially erased by tax friction in Lily's structure"], tax:"Irish-domiciled but DISTRIBUTING. Each dividend paid out may be taxable as income in France. The Irish wrapper reduces US dividend withholding from 30% to 15% internally, but the distribution itself still reaches Lily and must be declared. VWRA compounds silently — VHYL does not.", rate:7, teach:"VHYL pays you cash dividends regularly — sounds great. But every time cash lands in your account, the taxman may want a share. VWRA keeps the money inside the fund and compounds quietly, with no tax event. For a 15-year-old with 20 years of compounding ahead, silent growth wins over taxable income every time. VHYL isn't wrong — it's just less efficient here.", watch:"Annual dividend payout dates and French tax treatment of foreign fund distributions", sell:"If a better accumulating fund with similar dividend-quality tilt becomes available", go:"conditional", action:"Small position acceptable. Do not make it a core holding — VWRA compounds more efficiently." },
  VEVE: { name:"Vanguard FTSE Developed World Acc", type:"ETF", price:"~$80", verdict:"orange", label:"Conditional", score:61, layer:"Core ETF Foundation", headline:"90%+ overlap with VWRA — adds a second bill without adding diversification.", strengths:["Irish-domiciled accumulating — tax-efficient structure","Developed markets only — slightly lower volatility profile","Very low TER of 0.12%"], concerns:["If VWRA is held, VEVE covers almost exactly the same ground","VEVE + VFEM together replicate VWRA at a higher combined cost","Adding funds without reducing overlap is complexity, not strength"], tax:"Irish UCITS accumulating. No withholding event. Tax treatment identical to VWRA. The concern is not tax — it is redundancy with existing VWRA position.", rate:8.5, teach:"VEVE buys companies in the US, Europe, Japan, and Australia. VWRA does the same — and adds emerging markets on top. If Lily holds VWRA, she already owns everything inside VEVE. Buying both is like buying the same book twice. The extra money is better used adding to VWRA.", watch:"Portfolio overlap with VWRA position — reassess if both are held", sell:"Consolidate into VWRA when simplifying", go:"no", action:"Skip. VWRA already covers this universe. Adding VEVE creates duplication." },
  VFEM: { name:"Vanguard FTSE Emerging Markets Acc", type:"ETF", price:"~$20", verdict:"orange", label:"Conditional", score:58, layer:"Core ETF Foundation", headline:"VWRA already contains ~15% emerging markets — only add VFEM if deliberately tilting.", strengths:["Irish-domiciled accumulating — clean tax structure","Direct EM exposure: China, India, Brazil, Taiwan, South Korea","TER 0.22% — fair for an emerging markets fund"], concerns:["EM is already ~15% of VWRA — VFEM adds a tilt, not a new asset class","China is ~30% of the EM index — meaningful single-country concentration","Political and currency volatility is higher than developed markets"], tax:"Irish UCITS accumulating. No distribution, no withholding event. EM companies do carry higher underlying withholding drag absorbed within the fund, but this does not reach Lily directly.", rate:7.5, teach:"Emerging markets means fast-growing countries — China, India, Brazil. Higher potential returns, but sharper drops when things go wrong. VWRA already holds some. VFEM just increases the bet. Only consider it if Lily specifically wants more weight in fast-growing economies beyond what VWRA already provides.", watch:"China regulatory climate and India GDP growth — they drive most of this fund", sell:"If China's weight in the index exceeds 40% — single-country concentration becomes a real risk", go:"conditional", action:"Only if deliberately overweighting EM. Otherwise, VWRA already covers it." },
  VOO: { name:"Vanguard S&P 500 ETF · US-domiciled", type:"ETF", price:"~$530", verdict:"red", label:"Not Suitable", score:0, layer:"Not Suitable", headline:"FORBIDDEN — US-domiciled ETF. 30% withholding tax permanently destroys compounding.", strengths:["S&P 500 has returned ~10% annually long-term — excellent underlying index","Extremely low TER of 0.03%"], concerns:["US-domiciled — dividends face up to 30% withholding at source for non-US investors","Lebanon has no US tax treaty — Lily cannot reduce the rate below 30%","Over 20 years, 30% tax on every dividend could cost more than the investment gains","Use VWCE or VWRA — same S&P 500 exposure through an Irish wrapper at 0% distribution tax"], tax:"HARD STOP. VOO is domiciled in Delaware, USA. Every dividend it distributes is subject to 30% US withholding for non-treaty investors. France has a 15% treaty — Lebanon does not. Lily's effective rate could be 30% on every dividend, every year, for 20 years. This is a permanent compounding drag. VWRA gives almost identical exposure through Ireland with no withholding event.", rate:0, teach:"VOO owns the 500 biggest American companies and has made investors a lot of money over the years. But for Lily, there is a hidden tax: every dividend it pays has up to 30 cents taken by the US government before a cent reaches her. Over 20 years, that silent tax erodes the entire benefit. VWRA holds the same companies through Ireland, where that tax does not apply. Same destination — much smarter route.", watch:"N/A — do not purchase", sell:"Sell immediately if held. Replace with VWRA or VWCE.", go:"no", action:"Do not buy. Replace with VWRA on LSE or VWCE on Xetra — same exposure, zero withholding." },
  VTI: { name:"Vanguard Total Stock Market ETF · US-domiciled", type:"ETF", price:"~$280", verdict:"red", label:"Not Suitable", score:0, layer:"Not Suitable", headline:"FORBIDDEN — Same US withholding tax problem as VOO. Do not use.", strengths:["Covers 3,500+ US companies — broadest US market fund available","Ultra-low TER of 0.03%"], concerns:["US-domiciled — same 30% withholding drag as VOO","No Irish-domiciled equivalent covers this exact universe, but VWRA is the superior substitute"], tax:"Same structure as VOO. US-domiciled. Up to 30% withholding on all dividends. Absolute disqualifier for Lily's French-Lebanese investor profile.", rate:0, teach:"VTI buys nearly every company listed in the United States — small, medium, and large. Same great idea as VWRA but based in the US, which means the same dividend tax problem as VOO. VWRA gives Lily US exposure inside a tax-efficient Irish shell. There is no reason to use VTI.", watch:"N/A", sell:"Do not hold. Replace with VWRA.", go:"no", action:"Do not buy. Use VWRA instead." },
  SALIK: { name:"Salik Company PJSC — Dubai Toll Roads", type:"Stock", price:"~AED 2.50–3.00", verdict:"green", label:"Suitable", score:88, layer:"Conviction Layer", headline:"Legal monopoly. 49-year concession. Every car in Dubai pays Salik — no competition allowed.", strengths:["Sole toll operator in Dubai by government decree — competition is legally impossible","49-year concession: Lily will still be collecting tolls at age 64","UAE imposes 0% dividend withholding tax — Lily receives 100% of every dividend","New gates added automatically as Dubai's road network expands — revenue grows with the city"], concerns:["Revenue tied to Dubai traffic volume — a serious economic contraction would reduce journeys","Government holds 80%+ — minority shareholder interests may not always come first","AED/USD peg is stable but worth monitoring for EUR-reporting investors"], tax:"UAE charges 0% dividend withholding tax. Every dirham Salik distributes reaches Lily in full. French tax rules may require declaring the income, but there is no UAE deduction at source. Seek confirmation from a French tax advisor given the UAE FZE/LLC structure.", rate:10, teach:"Every car driving through Dubai passes a Salik toll gate. Salik owns every single one — by law. No other company can compete. The government awarded them this right for 49 years. As Dubai grows and new roads are built, new gates go up. The business does almost nothing except collect a fee every time a car passes. That is the kind of company you want to own — one where customers have no choice.", watch:"Monthly vehicle traffic data from Dubai's Roads and Transport Authority, and new gate announcements", sell:"If the UAE government materially alters or cancels the concession, or if Dubai enters a multi-year economic contraction", go:"yes", action:"Buy a meaningful position. Confirm DFM access via IBKR or use Emirates NBD Securities / FAB Securities." },
  SLDP: { name:"Solid Power — Solid-State Battery Developer", type:"Stock", price:"~$1.50–2.50", verdict:"orange", label:"Conditional", score:55, layer:"Opportunity Layer", headline:"BMW and Ford-backed solid-state battery bet — real technology, pre-commercial risk.", strengths:["BMW and Ford as strategic investors — validates the technology and provides runway","Solid-state batteries are the leading candidate to replace lithium-ion in EVs","Small position sizing means a total loss is manageable"], concerns:["Pre-revenue — the company burns cash developing a product not yet sold commercially","Solid-state batteries have been '5 years away' for over 20 years — timeline risk is real","Could be acquired cheaply or go to zero before reaching commercial scale"], tax:"US-listed stock. Currently no dividends. Tax impact is deferred to point of sale. Capital gains treatment depends on Lily's jurisdiction at exit — confirm with French tax advisor.", rate:15, teach:"Solid Power is trying to build a better battery — one that holds more energy, charges faster, and is safer than anything in electric cars today. BMW and Ford have put real money in because they believe it works. The risk is that building something and selling it profitably are very different things. This is a long-term bet on EV technology. Most bets like this lose. A few become huge. That's why you only put a small amount here.", watch:"BMW and Ford pilot production milestones, and any commercial supply agreement announcements", sell:"If BMW or Ford withdraws strategic partnership, or if cash runway drops below 12 months with no new raise", go:"conditional", action:"Small exploratory position only — $300 to $500. A 10-year option on solid-state battery technology." },
  UAMY: { name:"United States Antimony Corporation", type:"Stock", price:"~$0.50–1.50", verdict:"orange", label:"Conditional", score:54, layer:"Opportunity Layer", headline:"Only primary US antimony producer — critical mineral, strategic tailwind, small and volatile.", strengths:["Only primary-production antimony company in the US — a genuine scarcity position","Antimony is critical for defence ammunition, semiconductors, and flame retardants","US push to reduce dependence on China-sourced critical minerals creates real demand tailwind"], concerns:["Tiny company — low revenue, thinly traded, can be illiquid in volatile markets","Antimony is cyclical — spot price can fall 50%+ in commodity downturns","Environmental and operational risk in Montana and Mexico mining operations"], tax:"US-listed. No dividend. Capital gains taxed at Lily's jurisdiction on exit.", rate:12, teach:"Antimony is a metal you've probably never heard of — but it's inside military bullets, solar panels, and fire-resistant materials. China controls most of the world's supply, and the US is urgently looking for domestic alternatives. UAMY is the only company producing it domestically. That makes it rare — and also small, volatile, and dependent on a commodity price. This is a strategic speculation, not a business compounder.", watch:"Antimony spot price and any US government critical minerals procurement contract announcements", sell:"If antimony price stays below production cost for more than 6 months, or a better-funded US producer enters the market", go:"conditional", action:"Small position only — $200 to $400. Commodity speculation with a strategic angle." },
  BBAI: { name:"BigBear.ai — AI Analytics for Government", type:"Stock", price:"~$2–5", verdict:"orange", label:"Conditional", score:44, layer:"Opportunity Layer", headline:"Real government AI revenue — but dilution history is a serious ongoing concern.", strengths:["Active revenue from US defence and intelligence agency contracts — not vaporware","Government AI analytics is a durable, growing, and sticky category","Once embedded in classified workflows, displacement is very difficult"], concerns:["Serial share issuance history — share count has grown significantly, diluting existing holders","Still loss-making — cash burn continues and profitability timeline is unclear","Revenue concentrated in a few government contracts — renewal risk is real"], tax:"US-listed. No dividend. Standard capital gains treatment on exit.", rate:10, teach:"BigBear.ai sells AI software to the US military and intelligence agencies — helping them analyse satellite images, logistics data, and threats faster than humans can. That's a real business with real government customers. The concern: the company keeps issuing new shares to raise money, which means each share you own represents a smaller and smaller piece. Imagine a pizza being cut into more and more slices. Watch the slice count.", watch:"Quarterly share count — if dilution exceeds 5% per year, the thesis is deteriorating", sell:"If a share issuance exceeds 10% of outstanding shares without a matching revenue inflection", go:"conditional", action:"Proceed with caution. $200 to $350 maximum. Review dilution every quarter." },
  BLDP: { name:"Ballard Power Systems — Hydrogen Fuel Cells", type:"Stock", price:"~$2–3", verdict:"orange", label:"Conditional", score:48, layer:"Opportunity Layer", headline:"Priced near net cash — limited downside, long-shot upside if hydrogen timeline arrives.", strengths:["Stock trades near the cash on the balance sheet — you're almost getting the business for free","Real deployed products in buses and heavy transport — not a concept company","Hydrogen for heavy transport remains a credible long-horizon thesis"], concerns:["Hydrogen economy has kept shifting its timeline — could be 10–20 more years away","Ongoing cash burn — needs capital or a revenue breakthrough to avoid dilution","Battery-electric is displacing hydrogen in many segments hydrogen once targeted"], tax:"Canadian company, US-listed. No dividend. Capital gains on exit.", rate:8, teach:"Ballard builds engines that run on hydrogen instead of petrol. Big trucks and ships are hard to electrify with batteries — hydrogen is one answer. The interesting thing about Ballard right now is that its stock is priced so low it is almost worth just the cash sitting in its bank account. You're getting the business almost for free. That limits how much you can lose, even if the hydrogen timeline keeps slipping.", watch:"Cash runway and any new commercial contracts in marine or heavy-duty transport", sell:"If cash falls below $200M with no new raise or revenue breakthrough in sight", go:"conditional", action:"Small exploratory position — $300 to $500. Near-cash pricing limits the downside." },
  SOUN: { name:"SoundHound AI — Voice AI Platform", type:"Stock", price:"~$5–12", verdict:"orange", label:"Conditional", score:46, layer:"Opportunity Layer", headline:"Real auto and restaurant deployments — but competing against Google, Apple, and Amazon.", strengths:["Live in production: Honda, Stellantis vehicles and White Castle restaurants use the platform","Voice AI is a durable embedded category — once in the dashboard, hard to remove","Nvidia was an early investor — institutional technology validation"], concerns:["Competes directly with Google Assistant, Siri, and Alexa — all backed by vastly more capital","Still loss-making with ongoing dilution — the shareholder base keeps expanding","Revenue acceleration must happen fast to justify the current valuation"], tax:"US-listed. No dividend. Capital gains on exit.", rate:11, teach:"SoundHound makes the voice assistant that lets you talk to your car or order food without touching a screen. Honda has it built into their cars. White Castle uses it to take drive-through orders. The voice AI market is real and growing — but Google, Apple, and Amazon are all fighting for the same space with much bigger budgets. SoundHound has to find pockets those giants don't bother with.", watch:"Quarterly revenue growth rate and new enterprise contract wins, especially in automotive", sell:"If a major OEM like Honda moves to a competing platform, or dilution exceeds 8% per year", go:"conditional", action:"Watchlist. If entering, keep it to $200–$300 maximum. High competition risk." },
  PLUG: { name:"Plug Power — Hydrogen Systems", type:"Stock", price:"~$1–3", verdict:"red", label:"Not Suitable", score:22, layer:"Not Suitable", headline:"Going concern warnings, serial dilution, and years of cash destruction — pass.", strengths:["Large installed base of hydrogen forklifts at Amazon and Walmart warehouses"], concerns:["Auditors issued going concern warnings — survival beyond the near term is not guaranteed","Has raised billions of dollars and still loses money on every unit sold","Repeated large share issuances have severely diluted shareholder value","Debt levels are dangerous relative to the size of the business"], tax:"US-listed. Not relevant — this is a pass.", rate:0, teach:"Plug Power sells hydrogen-powered forklifts to big warehouses. Real products, real customers. The problem: they have been spending far more money than they earn for years and years, and have had to keep selling new shares just to stay alive. Each time they sell shares, each existing share is worth a little less. Auditors have questioned whether the company can survive. This is not a risky bet — this is a slow-motion crisis.", watch:"N/A — do not hold", sell:"Exit immediately if held.", go:"no", action:"Pass. Going concern risk plus serial dilution is a hard disqualifier." },
  OPEN: { name:"Opendoor Technologies — iBuying Real Estate", type:"Stock", price:"~$1–2", verdict:"red", label:"Not Suitable", score:25, layer:"Not Suitable", headline:"No durable moat — the business guesses house prices and hopes it's right.", strengths:["Large transaction volume — real revenue, not a zero-stage company","The residential real estate market is enormous in total size"], concerns:["Business model: buy houses at market price, sell them later — margins are razor-thin by design","Rising interest rates in 2022 crushed the model — existential sensitivity to macro timing","Lost billions when the housing market turned — no structural protection against cycles","Zillow tried the same model, lost billions, and shut it down"], tax:"US-listed. Not relevant — this is a pass.", rate:0, teach:"Opendoor wanted to make selling your house as easy as selling something on eBay. You click a button, they buy it instantly. Sounds clever. But the business requires Opendoor to constantly guess what houses are worth — and when they guess wrong, or when house prices fall, they lose millions. Zillow tried exactly this and gave up after losing billions. A business that depends on guessing house prices correctly does not have a durable advantage.", watch:"N/A — do not hold", sell:"Exit if held.", go:"no", action:"Pass. No moat. Structurally fragile business model." },
  DPRO: { name:"Draganfly Inc — Commercial Drones", type:"Stock", price:"~$0.50–2", verdict:"red", label:"Not Suitable", score:18, layer:"Not Suitable", headline:"Severe serial dilution disqualifies — regardless of how good the drone thesis is.", strengths:["Commercial and emergency-use drones are a real and growing market","Some genuine government and public safety contracts"], concerns:["Share count has exploded via repeated ATM offerings — capital destruction pattern","Revenue is tiny relative to the ongoing share issuance","Dilution is the primary disqualifier — it guarantees existing holders are permanently impaired"], tax:"Canadian/US-listed. Not relevant — this is a pass.", rate:0, teach:"Draganfly makes drones for emergencies, farming, and security. Interesting idea, real market. The problem: the company keeps printing new shares to raise money. So many new shares that the people who bought in earlier now own a much smaller piece than they did. Imagine owning 10% of a pie, and someone keeps cutting it into more and more pieces until your slice is almost nothing. The drone sector might be right. This company destroys what its shareholders already own.", watch:"N/A — disqualified", sell:"Do not hold. Watchlist only if sector thesis is of interest.", go:"no", action:"Pass. Serial dilution is a hard disqualifier in the GWB framework." },
};

// ─── Rule engine for unknown tickers ─────────────────────────────────────────
function ruleEngine(ticker, inputs) {
  const { isETF, isUSDomiciled, isIrish, isTerOk, isAccumulating, hasTrackRecord, aum1B, hasMoat, profitable, dilutionRisk, survivalRisk, under10 } = inputs;
  if (isETF) {
    if (isUSDomiciled) return { ticker, name:`${ticker} (User Evaluated)`, type:"ETF", price:"Fetching…", verdict:"red", label:"Not Suitable", score:0, layer:"Not Suitable", headline:"US-domiciled ETF — hard disqualifier. 30% withholding tax destroys compounding.", strengths:[], concerns:["US-domiciled — up to 30% dividend withholding tax","No protection under French-Lebanese investor rules","Use Irish-domiciled equivalent (VWRA or VWCE) instead"], tax:"US-domiciled ETFs face up to 30% withholding tax on all dividends for non-treaty investors. Absolute disqualifier regardless of any other quality.", rate:0, teach:"This fund is based in the United States. Every dividend it pays loses up to 30% to the US government before it reaches Lily. Over 20 years that silent tax can cost more than the gains. Always use the Irish-domiciled version instead.", watch:"N/A", sell:"Do not purchase.", go:"no", action:"Pass. Use Irish-domiciled equivalent.", _userAdded:true };
    const passes = [isIrish, isTerOk, hasTrackRecord, aum1B].filter(Boolean).length;
    const score = Math.round((passes / 4) * 80) + (isAccumulating ? 15 : 0);
    const verdict = score >= 85 ? "green" : score >= 50 ? "orange" : "red";
    return { ticker, name:`${ticker} (User Evaluated)`, type:"ETF", price:"Fetching…", verdict, label: verdict==="green"?"Suitable":verdict==="orange"?"Conditional":"Not Suitable", score, layer: verdict==="green"?"Core ETF Foundation":"Not Suitable", headline:`${passes}/4 mandatory criteria passed. ${isAccumulating?"Accumulating — efficient.":"Distributing — tax friction."}`, strengths:[isIrish&&"Irish-domiciled — optimal tax wrapper", isTerOk&&"TER below 0.25% — cost-efficient", isAccumulating&&"Accumulating — no dividend distribution event"].filter(Boolean), concerns:[!isIrish&&"Not Irish-domiciled — fails mandatory criterion", !isTerOk&&"TER above 0.25% — fails cost criterion", !isAccumulating&&"Distributing — creates taxable events for Lily", !aum1B&&"AUM below $1B — liquidity and closure risk"].filter(Boolean), tax: isIrish ? `Irish UCITS structure — favourable for Lily. ${isAccumulating?"Accumulating: no withholding event.":"Distributing: annual taxable distributions."}` : "Non-Irish domicile is a serious concern — withholding exposure must be assessed.", rate: isIrish&&isAccumulating ? 8.5 : 7, teach:"This fund was checked against Lily's four mandatory rules: Irish home, low fees, long history, large enough to trust.", watch:"TER and domicile status annually", sell:"If domicile changes or TER rises above 0.30%", go: verdict==="green"?"yes":verdict==="orange"?"conditional":"no", action: verdict==="green"?"Eligible for Core ETF Foundation.":verdict==="orange"?"Research further before committing.":"Does not meet GWB criteria.", _userAdded:true };
  }
  const issues = [!hasMoat, !profitable, dilutionRisk, survivalRisk].filter(Boolean).length;
  const score = Math.max(0, 80 - issues * 20);
  const verdict = issues===0?"green":issues===1?"orange":"red";
  return { ticker, name:`${ticker} (User Evaluated)`, type:"Stock", price:"Fetching…", verdict, label: verdict==="green"?"Suitable":verdict==="orange"?"Conditional":"Not Suitable", score, layer: verdict==="green"?"Conviction Layer": (issues<=1&&under10)?"Opportunity Layer":"Not Suitable", headline:`${issues} disqualifying factor${issues!==1?"s":""} identified against GWB stock criteria.`, strengths:[hasMoat&&"Identifiable competitive moat", profitable&&"Path to profitability visible"].filter(Boolean), concerns:[!hasMoat&&"No clear competitive moat — why will this exist in 10 years?", !profitable&&"No path to profitability — cash burn risk", dilutionRisk&&"Dilution risk — share count expanding, existing holders impaired", survivalRisk&&"Survival risk within 3 years"].filter(Boolean), tax:"Foreign-listed stock — assess dividend withholding and capital gains under French and UAE rules.", rate: issues===0?10:issues===1?8:5, teach:"This stock was checked against Lily's four core rules: a real moat, a path to profit, no dilution, and ability to survive the next three years.", watch:"Revenue growth and quarterly cash burn", sell:"If the moat is breached or cash runway falls below 12 months", go: verdict==="green"?"yes":verdict==="orange"?"conditional":"no", action: verdict==="green"?"Eligible for Conviction Layer.":verdict==="orange"?"Small position only. Monitor closely.":"Does not meet GWB criteria.", _userAdded:true };
}

// ─── Live price fetch via Anthropic API + web_search ─────────────────────────
async function fetchLivePrice(ticker) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Look up the current market price of ticker ${ticker}. Reply ONLY with a raw JSON object, no markdown, no explanation: {"price": "$XX.XX", "change": "+X.XX%", "changeDir": "up"} — changeDir is "up", "down", or "flat". If not found, return {"price": null, "change": null, "changeDir": "flat"}.`
        }]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("");
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.price ? parsed : null;
  } catch {
    return null;
  }
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
async function loadFromStorage() {
  try {
    const result = await window.storage.get('gwb-tickers');
    if (result && result.value) return JSON.parse(result.value);
  } catch {}
  return null;
}

async function saveToStorage(userEntries) {
  try {
    await window.storage.set('gwb-tickers', JSON.stringify(userEntries));
  } catch {}
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const CV = {
  green:  { bg:"#071a0c", bdr:"#174d22", acc:"#2ecc71", glow:"rgba(46,204,113,0.10)" },
  orange: { bg:"#1a1100", bdr:"#4d3300", acc:"#f0a500", glow:"rgba(240,165,0,0.10)" },
  red:    { bg:"#1a0707", bdr:"#4d1414", acc:"#e05252", glow:"rgba(224,82,82,0.10)" },
};
const GO = {
  yes:         { icon:"↗", label:"Go Ahead" },
  conditional: { icon:"→", label:"Proceed with Caution" },
  no:          { icon:"✕", label:"Pass" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Chart({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:"3px",height:"56px",marginTop:"10px"}}>
      {data.map((v,i) => {
        const h = Math.max(4,(v/max)*46);
        const lbl = v>=1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`;
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
            <div style={{fontSize:"7px",color:"#4a4a4a",fontFamily:"monospace",whiteSpace:"nowrap"}}>{lbl}</div>
            <div style={{width:"100%",height:`${h}px`,background:i===data.length-1?color:`${color}33`,borderRadius:"2px 2px 0 0"}}/>
            <div style={{fontSize:"7px",color:"#333",fontFamily:"monospace"}}>Y{i}</div>
          </div>
        );
      })}
    </div>
  );
}

function PriceBadge({ livePrice, staticPrice, fetching }) {
  if (fetching) {
    return (
      <div style={{display:"inline-flex",alignItems:"center",gap:"6px",marginTop:"6px"}}>
        <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#222",animation:"pulse 1.2s ease infinite"}}/>
        <span style={{fontSize:"11px",color:"#2a2a2a",fontFamily:"monospace",letterSpacing:"1px"}}>fetching live price…</span>
      </div>
    );
  }
  if (livePrice) {
    const isUp = livePrice.changeDir === "up";
    const isDown = livePrice.changeDir === "down";
    const changeColor = isUp ? "#2ecc71" : isDown ? "#e05252" : "#888";
    const changeIcon = isUp ? "▲" : isDown ? "▼" : "–";
    return (
      <div style={{display:"inline-flex",alignItems:"center",gap:"8px",marginTop:"6px",flexWrap:"wrap"}}>
        <span style={{fontSize:"18px",fontWeight:"700",color:"#f0ead6",fontFamily:"monospace",letterSpacing:"-0.5px"}}>{livePrice.price}</span>
        {livePrice.change && (
          <span style={{fontSize:"11px",color:changeColor,fontFamily:"monospace"}}>
            {changeIcon} {livePrice.change}
          </span>
        )}
        <span style={{fontSize:"7px",color:"#2ecc71",fontFamily:"monospace",letterSpacing:"2px",background:"#071a0c",border:"1px solid #174d22",borderRadius:"3px",padding:"2px 6px"}}>LIVE</span>
      </div>
    );
  }
  // Fallback to static price
  return <div style={{fontSize:"12px",color:"#484848",fontFamily:"monospace",marginTop:"4px"}}>{staticPrice}</div>;
}

function ResultCard({ r, amt, livePrice, fetching }) {
  const vkey = r.verdict in CV ? r.verdict : "orange";
  const c = CV[vkey];
  const rate = (parseFloat(r.rate)||8)/100;
  const init = parseFloat(amt)||1000;
  const yrs = Array.from({length:6},(_,i)=>Math.round(init*Math.pow(1+rate,i)));
  const gain = yrs[5]-init;
  const pct = ((gain/init)*100).toFixed(1);
  const go = GO[r.go]||GO.conditional;

  const Tile = ({label, children, bg="#0c0c0c", bdr="#1c1c1c"}) => (
    <div style={{background:bg,border:`1px solid ${bdr}`,borderRadius:"8px",padding:"13px"}}>
      <div style={{fontSize:"7px",letterSpacing:"3px",color:"#383838",fontFamily:"monospace",marginBottom:"9px"}}>{label}</div>
      {children}
    </div>
  );

  return (
    <div style={{animation:"up .35s ease both"}}>

      {/* ── Verdict banner ── */}
      <div style={{background:c.bg,border:`1px solid ${c.bdr}`,borderRadius:"12px",padding:"18px 20px",marginBottom:"8px",boxShadow:`0 0 40px ${c.glow}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"7px",letterSpacing:"3px",color:"#555",fontFamily:"monospace",marginBottom:"4px"}}>
              {(r.type||"").toUpperCase()} · {r.layer}
              {r._userAdded && <span style={{marginLeft:"8px",color:"#c9a96e",letterSpacing:"2px"}}>· SAVED</span>}
            </div>
            <div style={{fontSize:"26px",fontWeight:"700",color:"#f0ead6",letterSpacing:"-1px",lineHeight:"1"}}>{(r.ticker||"").toUpperCase()}</div>
            <div style={{fontSize:"11px",color:"#606060",fontFamily:"monospace",marginTop:"4px",lineHeight:"1.4"}}>{r.name}</div>
            <PriceBadge livePrice={livePrice} staticPrice={r.price} fetching={fetching}/>
          </div>
          <div style={{textAlign:"right",flexShrink:0,paddingLeft:"12px"}}>
            <div style={{fontSize:"10px",color:c.acc,letterSpacing:"2px",fontFamily:"monospace",marginBottom:"6px"}}>{(r.label||"").toUpperCase()}</div>
            <div style={{width:"60px",height:"3px",background:"#111",borderRadius:"2px",overflow:"hidden",marginLeft:"auto"}}>
              <div style={{height:"100%",width:`${r.score||0}%`,background:c.acc,borderRadius:"2px"}}/>
            </div>
            <div style={{fontSize:"8px",color:"#3a3a3a",fontFamily:"monospace",marginTop:"3px"}}>{r.score}/100</div>
          </div>
        </div>
        <div style={{marginTop:"12px",paddingTop:"12px",borderTop:`1px solid ${c.bdr}`,fontSize:"13px",color:"#c8c0b4",fontStyle:"italic",lineHeight:"1.65",fontFamily:"Georgia,serif"}}>{r.headline}</div>
      </div>

      {/* ── Strengths / Concerns ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"6px"}}>
        <Tile label="STRENGTHS">
          {(r.strengths||[]).map((s,i)=>(
            <div key={i} style={{display:"flex",gap:"6px",marginBottom:"6px"}}>
              <span style={{color:"#2ecc71",fontSize:"7px",marginTop:"3px",flexShrink:0}}>▲</span>
              <span style={{fontSize:"11px",color:"#b0b0b0",lineHeight:"1.5"}}>{s}</span>
            </div>
          ))}
        </Tile>
        <Tile label="CONCERNS">
          {(r.concerns||[]).map((s,i)=>(
            <div key={i} style={{display:"flex",gap:"6px",marginBottom:"6px"}}>
              <span style={{color:"#e05252",fontSize:"7px",marginTop:"3px",flexShrink:0}}>▼</span>
              <span style={{fontSize:"11px",color:"#b0b0b0",lineHeight:"1.5"}}>{s}</span>
            </div>
          ))}
        </Tile>
      </div>

      {/* ── Tax ── */}
      <Tile label="TAX — FRENCH-LEBANESE INVESTOR" bg="#0a0a14" bdr="#1c1c30">
        <div style={{fontSize:"12px",color:"#8888bb",lineHeight:"1.75"}}>{r.tax}</div>
      </Tile>

      {/* ── Projection ── */}
      {r.rate > 0 && (
        <div style={{background:"#070e08",border:"1px solid #141e14",borderRadius:"8px",padding:"14px",margin:"6px 0"}}>
          <div style={{fontSize:"7px",letterSpacing:"3px",color:"#333",fontFamily:"monospace",marginBottom:"10px"}}>5-YEAR PROJECTION — ${init.toLocaleString()} INVESTED</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontSize:"30px",color:"#2ecc71",fontWeight:"700",letterSpacing:"-1px",lineHeight:"1"}}>${yrs[5].toLocaleString()}</div>
              <div style={{fontSize:"10px",color:"#444",fontFamily:"monospace",marginTop:"4px"}}>+${gain.toLocaleString()} · +{pct}% · {r.rate}% p.a.</div>
            </div>
            <div style={{fontSize:"8px",color:"#2a2a2a",fontFamily:"monospace",textAlign:"right",lineHeight:"1.9"}}>
              {yrs.map((y,i)=><div key={i}>Y{i} → ${y.toLocaleString()}</div>)}
            </div>
          </div>
          <Chart data={yrs} color="#2ecc71"/>
        </div>
      )}

      {/* ── Teach Her Why ── */}
      <div style={{background:"linear-gradient(145deg,#0d0818,#080d14)",border:"1px solid #1e1535",borderRadius:"8px",padding:"14px",margin:"6px 0"}}>
        <div style={{fontSize:"7px",letterSpacing:"3px",color:"#3d2268",fontFamily:"monospace",marginBottom:"8px"}}>✦ TEACH HER WHY</div>
        <div style={{fontSize:"12px",color:"#b8a8d8",lineHeight:"1.85",fontStyle:"italic",fontFamily:"Georgia,serif"}}>{r.teach}</div>
      </div>

      {/* ── Watch / Sell ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"6px"}}>
        <Tile label="WATCH FOR">
          <div style={{fontSize:"11px",color:"#aaa",lineHeight:"1.5"}}><span style={{color:"#f0a500"}}>◎ </span>{r.watch}</div>
        </Tile>
        <Tile label="SELL IF">
          <div style={{fontSize:"11px",color:"#aaa",lineHeight:"1.5"}}><span style={{color:"#e05252"}}>✕ </span>{r.sell}</div>
        </Tile>
      </div>

      {/* ── Decision ── */}
      <div style={{background:c.bg,border:`1.5px solid ${c.bdr}`,borderRadius:"10px",padding:"15px 18px",display:"flex",alignItems:"center",gap:"14px",boxShadow:`0 0 24px ${c.glow}`}}>
        <div style={{width:"40px",height:"40px",borderRadius:"50%",background:c.bdr,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",color:c.acc,flexShrink:0,fontFamily:"monospace"}}>{go.icon}</div>
        <div>
          <div style={{fontSize:"7px",letterSpacing:"3px",color:"#383838",fontFamily:"monospace",marginBottom:"2px"}}>DECISION</div>
          <div style={{fontSize:"15px",color:c.acc,fontWeight:"600",fontFamily:"Georgia,serif"}}>{go.label}</div>
          <div style={{fontSize:"11px",color:"#686868",marginTop:"2px"}}>{r.action}</div>
        </div>
      </div>
    </div>
  );
}

function ManualForm({ ticker, onResult }) {
  const [f, setF] = useState({ isETF:true, isUSDomiciled:false, isIrish:false, isTerOk:false, isAccumulating:false, hasTrackRecord:false, aum1B:false, hasMoat:false, profitable:false, dilutionRisk:false, survivalRisk:false, under10:true });
  const tog = k => setF(p=>({...p,[k]:!p[k]}));

  const T = ({label, field, warn}) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"11px"}}>
      <span style={{fontSize:"12px",color:warn&&f[field]?"#e05252":"#aaa"}}>{label}</span>
      <div onClick={()=>tog(field)} style={{width:"38px",height:"20px",borderRadius:"10px",background:f[field]?"#2ecc71":"#1e1e1e",position:"relative",cursor:"pointer",flexShrink:0,transition:"background .2s"}}>
        <div style={{position:"absolute",top:"3px",left:f[field]?"19px":"3px",width:"14px",height:"14px",borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
      </div>
    </div>
  );

  return (
    <div style={{background:"#0d0d0d",border:"1px solid #1c1c1c",borderRadius:"10px",padding:"16px",marginBottom:"14px",animation:"up .3s ease both"}}>
      <div style={{fontSize:"7px",letterSpacing:"3px",color:"#383838",fontFamily:"monospace",marginBottom:"12px"}}>NEW TICKER · {ticker.toUpperCase()} · MANUAL EVALUATION</div>
      <div style={{display:"flex",gap:"7px",marginBottom:"13px"}}>
        {["ETF","Stock"].map(t=>(
          <button key={t} onClick={()=>setF(p=>({...p,isETF:t==="ETF"}))}
            style={{flex:1,padding:"7px",border:`1px solid ${f.isETF===(t==="ETF")?"#c9a96e":"#1e1e1e"}`,borderRadius:"6px",background:"transparent",color:f.isETF===(t==="ETF")?"#c9a96e":"#444",fontFamily:"monospace",fontSize:"10px",cursor:"pointer",letterSpacing:"1px"}}>
            {t}
          </button>
        ))}
      </div>
      {f.isETF ? <>
        <T label="US-domiciled? (instant disqualifier)" field="isUSDomiciled" warn/>
        <T label="Irish-domiciled (IE ISIN)?" field="isIrish"/>
        <T label="TER below 0.25%?" field="isTerOk"/>
        <T label="Accumulating share class?" field="isAccumulating"/>
        <T label="5+ year track record?" field="hasTrackRecord"/>
        <T label="AUM above $1 billion?" field="aum1B"/>
      </> : <>
        <T label="Clear competitive moat?" field="hasMoat"/>
        <T label="Path to profitability visible?" field="profitable"/>
        <T label="Dilution risk (share count rising)?" field="dilutionRisk" warn/>
        <T label="Survival risk within 3 years?" field="survivalRisk" warn/>
        <T label="Price currently under $10?" field="under10"/>
      </>}
      <button onClick={()=>onResult(ruleEngine(ticker,f))}
        style={{width:"100%",marginTop:"4px",background:"linear-gradient(135deg,#c9a96e,#9a7035)",border:"none",borderRadius:"7px",padding:"10px",fontSize:"9px",letterSpacing:"2px",fontFamily:"monospace",fontWeight:"600",color:"#080808",cursor:"pointer"}}>
        EVALUATE + ADD TO PORTFOLIO
      </button>
    </div>
  );
}

function SavedTickers({ userKeys, db, onSelect }) {
  if (userKeys.length === 0) return null;
  return (
    <div style={{background:"#0a0a0a",border:"1px solid #161616",borderRadius:"10px",padding:"13px",marginBottom:"14px",animation:"fade .4s ease"}}>
      <div style={{fontSize:"7px",letterSpacing:"3px",color:"#252525",fontFamily:"monospace",marginBottom:"10px"}}>
        ADDED TICKERS · {userKeys.length}
      </div>
      <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
        {userKeys.map(k => {
          const e = db[k];
          if (!e) return null;
          const dot = e.verdict==="green"?"#2ecc71":e.verdict==="orange"?"#f0a500":"#e05252";
          return (
            <button key={k} onClick={()=>onSelect(k)}
              style={{background:"transparent",border:"1px solid #1e1e1e",borderRadius:"4px",padding:"4px 9px",fontSize:"8px",color:"#404040",fontFamily:"monospace",cursor:"pointer",letterSpacing:"1px",display:"inline-flex",alignItems:"center",gap:"5px",transition:"color .15s,border-color .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.color="#999";e.currentTarget.style.borderColor="#444";}}
              onMouseLeave={e=>{e.currentTarget.style.color="#404040";e.currentTarget.style.borderColor="#1e1e1e";}}>
              <span style={{width:"5px",height:"5px",borderRadius:"50%",background:dot,display:"inline-block",flexShrink:0}}/>
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PortfolioLily() {
  const [db, setDb] = useState(DEFAULT_DB);
  const [userKeys, setUserKeys] = useState([]);   // tickers added by user
  const [ticker, setTicker] = useState("");
  const [amount, setAmount] = useState("1000");
  const [result, setResult] = useState(null);
  const [manual, setManual] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  // Inject fonts + keyframes
  useEffect(()=>{
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=DM+Mono:wght@400&display=swap');
      @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fade{from{opacity:0}to{opacity:1}}
      @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      input,button{font-family:inherit}
    `;
    document.head.appendChild(s);

    // Hydrate from storage on mount
    (async () => {
      const saved = await loadFromStorage();
      if (saved && Object.keys(saved).length > 0) {
        // Merge: DEFAULT_DB wins for core 17; user entries fill new tickers
        setDb({ ...saved, ...DEFAULT_DB });
        const savedUserKeys = Object.keys(saved).filter(k => !DEFAULT_DB[k]);
        setUserKeys(savedUserKeys);
      }
      setStorageReady(true);
    })();

    return () => document.head.removeChild(s);
  }, []);

  // Fire live price fetch for any ticker
  const triggerPriceFetch = useCallback(async (sym) => {
    setLivePrice(null);
    setFetchingPrice(true);
    const data = await fetchLivePrice(sym);
    setLivePrice(data);
    setFetchingPrice(false);
  }, []);

  const CHIPS = ["VWRA","VWCE","SALIK","SLDP","UAMY","BBAI","BLDP","SOUN","VOO","PLUG"];

  const lookup = useCallback((t) => {
    const k = t.trim().toUpperCase();
    if (!k) return;
    const hit = db[k];
    if (hit) {
      setResult({ ...hit, ticker: k });
      setManual(false);
      triggerPriceFetch(k);
    } else {
      setResult(null);
      setLivePrice(null);
      setFetchingPrice(false);
      setManual(true);
    }
  }, [db, triggerPriceFetch]);

  const handleManualResult = useCallback(async (r) => {
    const k = r.ticker.toUpperCase();
    const newDb = { ...db, [k]: r };
    const newUserKeys = userKeys.includes(k) ? userKeys : [...userKeys, k];

    setDb(newDb);
    setUserKeys(newUserKeys);
    setResult({ ...r });
    setManual(false);

    // Save to storage (only user-added entries)
    const toSave = {};
    newUserKeys.forEach(key => { if (newDb[key]) toSave[key] = newDb[key]; });
    await saveToStorage(toSave);

    // Fire price fetch
    triggerPriceFetch(k);
  }, [db, userKeys, triggerPriceFetch]);

  const inp = extra => ({ background:"#080808", border:"1px solid #1e1e1e", borderRadius:"7px", padding:"10px 12px", color:"#f0ead6", fontFamily:"monospace", outline:"none", transition:"border-color .15s", ...extra });

  return (
    <div style={{minHeight:"100vh",background:"#080808",color:"#f0ead6",padding:"24px 16px 64px",maxWidth:"660px",margin:"0 auto"}}>

      {/* ── Header ── */}
      <div style={{marginBottom:"24px",animation:"fade .5s ease"}}>
        <div style={{fontSize:"7px",letterSpacing:"6px",color:"#202020",fontFamily:"monospace",marginBottom:"8px"}}>INTERACTIVE BROKERS · GENERATIONAL PORTFOLIO</div>
        <h1 style={{fontSize:"22px",fontWeight:"600",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:"1.2",color:"#f0ead6"}}>
          Portfolio Lily<br/>
          <span style={{color:"#c9a96e"}}>Wealth Builder</span>
        </h1>
        <p style={{fontSize:"11px",color:"#303030",fontFamily:"monospace",marginTop:"6px",letterSpacing:"1px"}}>FRENCH-LEBANESE TAX RULES · GWB FRAMEWORK · LIVE PRICES</p>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"12px"}}>
          <div style={{height:"1px",width:"28px",background:"linear-gradient(90deg,#c9a96e,transparent)"}}/>
          <div style={{fontSize:"9px",color:"#282828",fontFamily:"monospace",letterSpacing:"2px"}}>BUILT FOR HER · MANAGED BY YOU</div>
        </div>
      </div>

      {/* ── Input ── */}
      <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:"12px",padding:"14px",marginBottom:"16px"}}>
        <div style={{display:"flex",gap:"7px",alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:"7px",letterSpacing:"3px",color:"#282828",fontFamily:"monospace",marginBottom:"5px"}}>TICKER</div>
            <input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())}
              onKeyDown={e=>e.key==="Enter"&&lookup(ticker)}
              placeholder="e.g. VWRA, SALIK, SLDP"
              style={inp({width:"100%",fontSize:"15px",letterSpacing:"2px"})}
              onFocus={e=>(e.target.style.borderColor="#c9a96e")}
              onBlur={e=>(e.target.style.borderColor="#1e1e1e")}/>
          </div>
          <div>
            <div style={{fontSize:"7px",letterSpacing:"3px",color:"#282828",fontFamily:"monospace",marginBottom:"5px"}}>AMOUNT</div>
            <input value={amount} onChange={e=>setAmount(e.target.value)}
              style={inp({width:"80px",fontSize:"13px"})}
              onFocus={e=>(e.target.style.borderColor="#c9a96e")}
              onBlur={e=>(e.target.style.borderColor="#1e1e1e")}/>
          </div>
          <button onClick={()=>lookup(ticker)} disabled={!ticker.trim()}
            style={{background:!ticker.trim()?"#111":"linear-gradient(135deg,#c9a96e,#9a7035)",border:"none",borderRadius:"7px",padding:"10px 15px",fontSize:"8px",letterSpacing:"2px",fontFamily:"monospace",fontWeight:"600",color:!ticker.trim()?"#2a2a2a":"#080808",cursor:"pointer",whiteSpace:"nowrap"}}>
            ANALYZE
          </button>
        </div>
        <div style={{display:"flex",gap:"4px",marginTop:"10px",flexWrap:"wrap"}}>
          {CHIPS.map(chip=>(
            <button key={chip} onClick={()=>{ setTicker(chip); lookup(chip); }}
              style={{background:"transparent",border:"1px solid #191919",borderRadius:"4px",padding:"3px 8px",fontSize:"8px",color:"#303030",fontFamily:"monospace",cursor:"pointer",letterSpacing:"1px",transition:"color .15s,border-color .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.color="#999";e.currentTarget.style.borderColor="#444";}}
              onMouseLeave={e=>{e.currentTarget.style.color="#303030";e.currentTarget.style.borderColor="#191919";}}>
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── User-added tickers ── */}
      {storageReady && (
        <SavedTickers
          userKeys={userKeys}
          db={db}
          onSelect={k=>{ setTicker(k); lookup(k); }}
        />
      )}

      {/* ── Manual form (unknown ticker) ── */}
      {manual && <ManualForm ticker={ticker} onResult={handleManualResult}/>}

      {/* ── Result card ── */}
      {result && !manual && (
        <ResultCard r={result} amt={amount} livePrice={livePrice} fetching={fetchingPrice}/>
      )}

      {/* ── Empty state ── */}
      {!result && !manual && (
        <div style={{textAlign:"center",padding:"44px 0",animation:"fade .6s ease"}}>
          <div style={{fontSize:"9px",color:"#c9a96e",fontFamily:"monospace",letterSpacing:"4px",marginBottom:"10px",opacity:.4}}>◈</div>
          <div style={{fontSize:"8px",color:"#1e1e1e",fontFamily:"monospace",letterSpacing:"2px",marginBottom:"14px"}}>ENTER A TICKER TO BEGIN</div>
          <div style={{fontSize:"9px",color:"#161616",fontFamily:"monospace",lineHeight:"2"}}>
            VWRA · VWCE · VHYL · VEVE · VFEM · VOO · VTI<br/>
            SALIK · SLDP · UAMY · BBAI · BLDP · SOUN<br/>
            PLUG · OPEN · DPRO
          </div>
          <div style={{marginTop:"16px",fontSize:"8px",color:"#1a1a1a",fontFamily:"monospace",letterSpacing:"1px"}}>
            ◆ Live prices via Anthropic API · Analysis from GWB rules
          </div>
        </div>
      )}
    </div>
  );
}
