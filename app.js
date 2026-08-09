const CATEGORIES={"CONTAS": ["FINANCIAMENTO", "CONDOMINIO", "IPTU / VAGA", "INTERNET", "COMGAS", "ENEL", "FAXINA", "NETFLIX", "ML/DISNEY", "AMAZON", "SEGURO BOLSA", "SEGURO APTO", "SEGURO CARRO", "IPVA", "OUTROS"], "ALICE": ["ESCOLA", "CONVENIO", "PEDIATRA", "DENTISTA", "ESPORTE", "FARMA/SAÚDE", "ROUPAS", "PRESENTES", "FESTA", "HSP", "PASSEIOS", "OUTROS"], "CASAL": ["CONV ODONTO", "MERCADO", "RESTAURANTES", "CARRO", "PASSEIOS", "FARMÁCIA", "TRANSPORTE", "MANUTENÇÃO", "ROUPAS", "MÓVEIS", "PRESENTES", "VIAGEM", "OUTROS"], "WILLIAM": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"], "CAROL": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"]};
const ICONS={"FINANCIAMENTO": "🏦", "CONDOMINIO": "🏢", "IPTU / VAGA": "🅿️", "INTERNET": "🌐", "COMGAS": "🔥", "ENEL": "⚡", "FAXINA": "🧹", "NETFLIX": "📺", "ML/DISNEY": "📺", "AMAZON": "📦", "SEGURO BOLSA": "👜", "SEGURO APTO": "🏠", "SEGURO CARRO": "🚗", "IPVA": "🚘", "ESCOLA": "🎒", "CONVENIO": "🩺", "PEDIATRA": "👩‍⚕️", "DENTISTA": "🦷", "ESPORTE": "🏃", "FARMA/SAÚDE": "💊", "ROUPAS": "👕", "PRESENTES": "🎁", "FESTA": "🎉", "HSP": "🏥", "CONV ODONTO": "🦷", "MERCADO": "🛒", "RESTAURANTES": "🍽️", "CARRO": "🚗", "PASSEIOS": "🎡", "FARMÁCIA": "💊", "FARMACIA": "💊", "TRANSPORTE": "🚌", "MANUTENÇÃO": "🛠️", "MÓVEIS": "🪑", "VIAGEM": "✈️", "CELULAR": "📱", "ALIMENTAÇÃO": "🥪", "DOCS": "📄", "COMPRAS": "🛍️", "BELEZA": "💇", "DENTISTA/MED": "🩺", "SEGURO": "🛡️", "OUTROS": "📌"};
const EXPORT_ORDER={"CONTAS": ["FINANCIAMENTO", "CONDOMINIO", "IPTU / VAGA", "INTERNET", "COMGAS", "ENEL", "FAXINA", "NETFLIX", "ML/DISNEY", "AMAZON", "SEGURO BOLSA", "SEGURO APTO", "SEGURO CARRO", "IPVA", "OUTROS"], "ALICE": ["ESCOLA", "CONVENIO", "PEDIATRA", "DENTISTA", "ESPORTE", "FARMA/SAÚDE", "ROUPAS", "PRESENTES", "FESTA", "HSP", "PASSEIOS", "OUTROS"], "CASAL": ["CONV ODONTO", "MERCADO", "RESTAURANTES", "CARRO", "PASSEIOS", "FARMÁCIA", "TRANSPORTE", "MANUTENÇÃO", "ROUPAS", "MÓVEIS", "PRESENTES", "VIAGEM", "OUTROS"], "WILLIAM": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"], "CAROL": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"]};
const GROUP_ICON={CONTAS:"🏠",ALICE:"🧒",CASAL:"💞",WILLIAM:"👨",CAROL:"👩"};
const SUPABASE_URL="https://ofkvpfsgxrojdygvuune.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_vsd_A1GKv9Fr1Gubf8fJaw_XHHywBRM";
const db=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const KEY="contas_pwa_transactions_v1";
let remoteRows=[],historicalData={},currentUser=null,realtimeChannel=null;
let current=new Date(); current.setDate(1); let editingId=null;

const $=s=>document.querySelector(s);
const money=n=>(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const mkey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const localLoad=()=>JSON.parse(localStorage.getItem(KEY)||"[]");
const load=()=>remoteRows;
const save=()=>{};
const addMonths=(date,n)=>{let d=new Date(date+"T12:00:00"),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return d.toISOString().slice(0,10)};
const monthsBetween=(start,end)=>{let s=new Date(start+"T12:00:00"),[y,m]=end.split("-").map(Number);return Math.max(1,(y-s.getFullYear())*12+(m-1-s.getMonth())+1)};

function normalizeLegacy(x){
 if(x.group==="INDIVIDUAL"){x.group=x.owner==="C"?"CAROL":"WILLIAM";delete x.owner}
 if(!x.entryType)x.entryType="EXPENSE";
 if(!x.paymentSplit)x.paymentSplit=null;
 return x;
}
function loadNorm(){return load().map(x=>normalizeLegacy({...x}))}
function dbToApp(r){
 return {id:r.id,purchaseId:r.purchase_id,entryType:r.entry_type,description:r.description||"",group:r.grupo,category:r.categoria,paidBy:r.paid_by,payment:r.payment==="CASH"?"$":r.payment,card:r.card,paymentSplit:r.payment_split||null,incomeCategory:r.income_category,receivedBy:r.received_by,amount:Number(r.amount),date:r.data,competence:r.competence,installmentLabel:r.installment_label,recurringLabel:r.recurring_label};
}
function appToDb(x){
 const split=x.entryType==="EXPENSE"&&x.paymentSplit?x.paymentSplit:null;
 return {id:x.id,entry_type:x.entryType,description:x.description||null,grupo:x.entryType==="EXPENSE"?x.group:null,categoria:x.entryType==="EXPENSE"?x.category:null,paid_by:x.entryType==="EXPENSE"&&!split?x.paidBy:null,payment:x.entryType==="EXPENSE"&&!split?(x.payment==="$"?"CASH":x.payment):(x.entryType==="THIRD_PARTY"?"CARD":null),card:(x.entryType==="EXPENSE"&&!split&&x.payment==="CARD")||x.entryType==="THIRD_PARTY"?x.card:null,payment_split:split,income_category:x.entryType==="INCOME"?x.incomeCategory:null,received_by:x.entryType==="INCOME"?x.receivedBy:null,amount:Number(x.amount),data:x.date,competence:x.competence,purchase_id:x.purchaseId||null,installment_label:x.installmentLabel||null,recurring_label:x.recurringLabel||null};
}
function hasSplit(x){return !!(x?.paymentSplit?.W||x?.paymentSplit?.C)}
function paidW(x){return hasSplit(x)?Number(x.paymentSplit?.W?.amount||0):(x.paidBy==="W"?Number(x.amount):0)}
function paidC(x){return hasSplit(x)?Number(x.paymentSplit?.C?.amount||0):(x.paidBy==="C"?Number(x.amount):0)}
function cardPart(x,card){
 if(hasSplit(x)){
   let total=0;
   for(const p of ["W","C"]){
     const part=x.paymentSplit?.[p];
     if(part&&part.payment==="CARD"&&part.card===card)total+=Number(part.amount||0);
   }
   return total;
 }
 return x.payment==="CARD"&&x.card===card?Number(x.amount):0;
}
function splitMeta(x){
 if(!hasSplit(x))return "";
 const fmt=(who)=>{const p=x.paymentSplit?.[who];if(!p||!Number(p.amount))return null;const method=p.payment==="CARD"?`💳 ${p.card}`:"$ CASH";return `${who} ${money(Number(p.amount))} (${method})`};
 return [fmt("W"),fmt("C")].filter(Boolean).join(" · ");
}
function setSync(t){const el=$("#syncStatus");if(el)el.textContent=t}
async function refreshRemote(){
 setSync("☁️ SINCRONIZANDO...");
 const [launchRes,histRes]=await Promise.all([
   db.from("lancamentos").select("*").order("data",{ascending:true}),
   db.from("historico_mensal").select("competence,payload").order("competence",{ascending:true})
 ]);
 if(launchRes.error){console.error(launchRes.error);setSync("⚠️ ERRO");return false}
 if(histRes.error){console.error(histRes.error);setSync("⚠️ HISTÓRICO NÃO CARREGADO");return false}
 remoteRows=(launchRes.data||[]).map(dbToApp);
 historicalData={};
 for(const r of (histRes.data||[]))historicalData[r.competence]=r.payload;
 setSync("☁️ SINCRONIZADO");render();checkMigration();return true;
}
function subscribeRealtime(){
 if(realtimeChannel)db.removeChannel(realtimeChannel);
 realtimeChannel=db.channel("lancamentos-sync").on("postgres_changes",{event:"*",schema:"public",table:"lancamentos"},()=>refreshRemote()).subscribe();
}
function liveForMonth(key){return loadNorm().filter(x=>x.competence===key)}

function buildMonth(key){
 const hist=historicalData[key]||null,live=liveForMonth(key),sum=a=>a.reduce((s,x)=>s+Number(x.amount),0);
 const expenses=live.filter(x=>x.entryType==="EXPENSE"),incomes=live.filter(x=>x.entryType==="INCOME"),thirdParty=live.filter(x=>x.entryType==="THIRD_PARTY");
 const famLive=expenses.filter(x=>["CONTAS","ALICE","CASAL"].includes(x.group));

 const family={
   total:(hist?.family?.total||0)+sum(famLive),
   W:(hist?.family?.W||0)+famLive.reduce((s,x)=>s+paidW(x),0),
   C:(hist?.family?.C||0)+famLive.reduce((s,x)=>s+paidC(x),0)
 };

 const ownCardW=(hist?.cards?.W||0)+expenses.reduce((s,x)=>s+cardPart(x,"W"),0);
 const ownCardC=(hist?.cards?.C||0)+expenses.reduce((s,x)=>s+cardPart(x,"C"),0);
 const thirdW=sum(thirdParty.filter(x=>x.card==="W")),thirdC=sum(thirdParty.filter(x=>x.card==="C"));
 const cards={W:ownCardW+thirdW,C:ownCardC+thirdC,ownW:ownCardW,ownC:ownCardC,thirdW,thirdC};

 const groups={};
 ["CONTAS","ALICE","CASAL","WILLIAM","CAROL"].forEach(g=>{
   const h=hist?.groups?.[g]||{W:0,C:0,total:0},gl=expenses.filter(x=>x.group===g);
   groups[g]={W:Number(h.W||0)+gl.reduce((s,x)=>s+paidW(x),0),C:Number(h.C||0)+gl.reduce((s,x)=>s+paidC(x),0),total:Number(h.total||0)+sum(gl)};
 });

 const familyNet=(family.W-family.C)/2;
 const williamPaidByCarol=expenses.filter(x=>x.group==="WILLIAM").reduce((s,x)=>s+paidC(x),0);
 const carolPaidByWilliam=expenses.filter(x=>x.group==="CAROL").reduce((s,x)=>s+paidW(x),0);
 const williamReceives=familyNet+carolPaidByWilliam-williamPaidByCarol;

 const cmap=new Map();
 (hist?.categories||[]).forEach(c=>{let v=cmap.get(c.category)||{category:c.category,total:0,groups:new Set()};v.total+=Number(c.total||0);v.groups.add(c.group);cmap.set(c.category,v)});
 expenses.forEach(x=>{let v=cmap.get(x.category)||{category:x.category,total:0,groups:new Set()};v.total+=Number(x.amount);v.groups.add(x.group);cmap.set(x.category,v)});

 const histIncomeW=Number(hist?.income?.W||0),histIncomeC=Number(hist?.income?.C||0);
 const liveIncomeW=sum(incomes.filter(x=>x.receivedBy==="W")),liveIncomeC=sum(incomes.filter(x=>x.receivedBy==="C"));
 const incomeMap=new Map();
 (hist?.income?.byCategory||[]).forEach(([k,v])=>incomeMap.set(k,(incomeMap.get(k)||0)+Number(v||0)));
 incomes.forEach(x=>{let k=x.incomeCategory||"OUTROS";incomeMap.set(k,(incomeMap.get(k)||0)+Number(x.amount))});
 const salaryW=Number(hist?.income?.salaryW||0)+incomes.filter(x=>x.receivedBy==="W"&&x.incomeCategory==="SALARIO").reduce((s,x)=>s+Number(x.amount),0);
 const salaryC=Number(hist?.income?.salaryC||0)+incomes.filter(x=>x.receivedBy==="C"&&x.incomeCategory==="SALARIO").reduce((s,x)=>s+Number(x.amount),0);

 const totalExpenses=family.total+groups.WILLIAM.total+groups.CAROL.total;
 return {hist,live,expenses,incomes,thirdParty,family,cards,groups,williamReceives,categories:[...cmap.values()].sort((a,b)=>b.total-a.total),income:{W:histIncomeW+liveIncomeW,C:histIncomeC+liveIncomeC,total:histIncomeW+histIncomeC+liveIncomeW+liveIncomeC,salaryW,salaryC,byCategory:[...incomeMap.entries()].sort((a,b)=>b[1]-a[1])},totalExpenses};
}
function chartValue(key,filter){
 const d=buildMonth(key);
 if(filter==="FAMILY")return d.family.total;
 if(filter==="CARDS")return d.cards.W+d.cards.C;
 if(filter==="INCOME")return d.income.total;
 if(filter==="SALARY_W")return d.income.salaryW;
 if(filter==="SALARY_C")return d.income.salaryC;
 if(filter==="NET")return d.income.total-d.totalExpenses;
 return d.groups[filter]?.total||0;
}

function renderChart(){
 const filter=$("#chartFilter").value,year=current.getFullYear(),months=Array.from({length:12},(_,i)=>`${year}-${String(i+1).padStart(2,"0")}`),labels=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
 const data=months.map(k=>chartValue(k,filter)),valid=data.map((v,i)=>v!==0?i:-1).filter(i=>i>=0);$("#chartYear").textContent=String(year);
 if(!valid.length){$("#historyChart").innerHTML=`<div class="empty-chart">SEM DADOS PARA ${year} NESTE FILTRO.</div>`;return}
 const W=700,H=190,pad=28,max=Math.max(...data.map(Math.abs),1),xs=i=>pad+i*(W-2*pad)/11,ys=v=>H/2-(v/max)*(H/2-pad);
 let pts=valid.map(i=>`${xs(i)},${ys(data[i])}`).join(" "),dots=valid.map(i=>`<circle cx="${xs(i)}" cy="${ys(data[i])}" r="4"></circle><text class="chart-value" x="${xs(i)}" y="${ys(data[i])-8}" text-anchor="middle">${(data[i]/1000).toFixed(1)}k</text>`).join(""),xl=labels.map((l,i)=>`<text class="chart-label" x="${xs(i)}" y="${H-5}" text-anchor="middle">${l}</text>`).join("");
 $("#historyChart").innerHTML=`<svg viewBox="0 0 ${W} ${H}"><line x1="${pad}" y1="${H/2}" x2="${W-pad}" y2="${H/2}" stroke="#d5dde4"/><polyline points="${pts}" fill="none" stroke="#526f92" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>${dots}${xl}</svg>`;
}

function render(){
 const key=mkey(current),d=buildMonth(key);
 $("#monthTitle").textContent=current.toLocaleDateString("pt-BR",{month:"long",year:"numeric"}).toUpperCase();
 $("#familyTotal").textContent=money(d.family.total);$("#wPaid").textContent=money(d.family.W);$("#cPaid").textContent=money(d.family.C);
 $("#settlement").textContent=Math.abs(d.williamReceives)<.005?"SEM ACERTO NO MÊS":d.williamReceives>0?`W TEM A RECEBER ${money(d.williamReceives)}`:`C TEM A RECEBER ${money(-d.williamReceives)}`;
 $("#cardW").textContent=money(d.cards.W);$("#cardC").textContent=money(d.cards.C);$("#cardTotal").textContent=money(d.cards.W+d.cards.C);
 const cardSection=$("#cardTotal").closest(".card");let old=cardSection.querySelector(".bill-detail-wrap");if(old)old.remove();let detail=document.createElement("div");detail.className="bill-detail-wrap";detail.innerHTML=`<div class="bill-detail"><span>COMPRAS PRÓPRIAS</span><strong>${money(d.cards.ownW+d.cards.ownC)}</strong></div><div class="bill-detail"><span>TERCEIROS</span><strong>${money(d.cards.thirdW+d.cards.thirdC)}</strong></div>`;cardSection.appendChild(detail);
 $("#totalContas").textContent=money(d.groups.CONTAS.total);$("#totalAlice").textContent=money(d.groups.ALICE.total);$("#totalCasal").textContent=money(d.groups.CASAL.total);$("#totalWilliam").textContent=money(d.groups.WILLIAM.total);$("#totalCarol").textContent=money(d.groups.CAROL.total);
 $("#categoryTotals").innerHTML=d.categories.length?d.categories.map(c=>`<div class="catrow"><div class="catname"><span class="caticon">${ICONS[c.category]||"📌"}</span><span>${c.category.toUpperCase()}<span class="catmeta">${[...c.groups].map(g=>(GROUP_ICON[g]||"•")+" "+g).join(" · ")}</span></span></div><div class="catvalue">${money(c.total)}</div></div>`).join(""):`<div class="mini">SEM GASTOS NESTE MÊS.</div>`;
 $("#incomeW").textContent=money(d.income.W);$("#incomeC").textContent=money(d.income.C);$("#incomeTotal").textContent=money(d.income.total);
 const incomeNames={SALARIO:"SALÁRIO",BONUS:"BÔNUS",REEMBOLSO:"REEMBOLSO",VENDA:"VENDA",RESTITUICAO:"RESTITUIÇÃO",OUTROS:"OUTROS"};
 $("#incomeBreakdown").innerHTML=d.income.byCategory.length?d.income.byCategory.map(([k,v])=>`<div class="income-row"><span>${incomeNames[k]||k}</span><strong>${money(v)}</strong></div>`).join(""):`<div class="mini">SEM RECEITAS NESTE MÊS.</div>`;
 $("#historicalNotice").classList.toggle("hidden",!d.hist);
 const filter=$("#filterGroup").value,shown=d.live.filter(x=>{
   if(!filter) return true;
   if(filter==="WILLIAM") return (x.entryType==="EXPENSE"&&x.group==="WILLIAM") || (x.entryType==="INCOME"&&x.receivedBy==="W") || (x.entryType==="THIRD_PARTY"&&x.card==="W");
   if(filter==="CAROL") return (x.entryType==="EXPENSE"&&x.group==="CAROL") || (x.entryType==="INCOME"&&x.receivedBy==="C") || (x.entryType==="THIRD_PARTY"&&x.card==="C");
   return x.entryType==="EXPENSE"&&x.group===filter;
 }).sort((a,b)=>b.date.localeCompare(a.date));
 if(shown.length){
   $("#transactions").innerHTML=shown.map(x=>{
     const inc=x.entryType==="INCOME";
     const third=x.entryType==="THIRD_PARTY";
     const icon=inc?"💵":third?"🤝":(ICONS[x.category]||"📌");
     let meta="";
     if(inc){
       meta=`RECEITA · ${incomeNames[x.incomeCategory]||x.incomeCategory} · ${x.date.split("-").reverse().join("/")} · RECEBIDO POR ${x.receivedBy}`;
     }else if(third){
       meta=`TERCEIROS · ${x.date.split("-").reverse().join("/")} · 💳 ${x.card}`;
     }else{
       const paymentText=hasSplit(x)
         ? `✂️ ${splitMeta(x)}`
         : `PAGO POR ${x.paidBy} · ${x.payment==="CARD"?"💳 "+x.card:"$ CASH"}`;
       meta=`${GROUP_ICON[x.group]} ${x.group} · ${x.category} · ${x.date.split("-").reverse().join("/")} · ${paymentText}${x.installmentLabel?" · "+x.installmentLabel:""}${x.recurringLabel?" · 🔁 "+x.recurringLabel:""}`;
     }
     return `<div class="tx"><div><strong>${icon} ${x.description}</strong><div class="meta">${meta}</div></div><div class="amount">${money(Number(x.amount))}<div class="tx-actions"><button class="action-btn action-edit" data-edit="${x.id}">✏ EDITAR</button><button class="action-btn action-delete" data-del="${x.id}">🗑 EXCLUIR</button></div></div></div>`;
   }).join("");
 }else{
   $("#transactions").innerHTML='<div class="mini">SEM LANÇAMENTOS NESTE MÊS.</div>';
 }
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openEdit(b.dataset.edit));document.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(!confirm("Excluir este lançamento?"))return;setSync("☁️ SALVANDO...");const {error}=await db.from("lancamentos").delete().eq("id",b.dataset.del);if(error){alert("Erro ao excluir: "+error.message);setSync("⚠️ ERRO");return}await refreshRemote()});
 renderChart();
}

function orderedCategories(group){
 if(group==="CASAL"){const priority={"RESTAURANTES":0,"MERCADO":1,"PASSEIOS":2};return [...CATEGORIES[group]].sort((a,b)=>{const pa=priority[a]??99,pb=priority[b]??99;if(pa!==pb)return pa-pb;return a.localeCompare(b,"pt-BR")})}
 return [...CATEGORIES[group]].sort((a,b)=>a.localeCompare(b,"pt-BR"));
}
function updateCategories(){let g=$("#group").value,ordered=orderedCategories(g);$("#category").innerHTML=ordered.map(c=>`<option value="${c}">${ICONS[c]||"📌"} ${c}</option>`).join("");if(g==="CASAL")$("#category").value="RESTAURANTES"}
function updatePayment(){$("#cardFields").classList.toggle("hidden",$("#payment").value!=="CARD")}
function updateRecurring(){$("#recurringFields").classList.toggle("hidden",!$("#recurring").checked)}
function updateSplitPayment(){
 const split=$("#splitPayment").checked&&$("#entryType").value==="EXPENSE";
 $("#splitPaymentFields").classList.toggle("hidden",!split);
 $("#expensePaymentFields").classList.toggle("hidden",split||$("#entryType").value!=="EXPENSE");
 if(split){
   $("#cardFields").classList.add("hidden");
   $("#recurring").checked=false;$("#recurringFields").classList.add("hidden");
 }
 $("#splitCardWLabel").classList.toggle("hidden",$("#splitPaymentW").value!=="CARD");
 $("#splitCardCLabel").classList.toggle("hidden",$("#splitPaymentC").value!=="CARD");
}
function updateEntryType(){
 const type=$("#entryType").value,inc=type==="INCOME",third=type==="THIRD_PARTY",expense=type==="EXPENSE";
 $("#groupLabel").classList.toggle("hidden",inc||third);
 $("#categoryLabel").classList.toggle("hidden",inc||third);
 $("#incomeFields").classList.toggle("hidden",!inc);
 $("#thirdPartyNote").classList.toggle("hidden",!third);
 $("#splitPaymentToggle").classList.toggle("hidden",!expense);
 $("#recurring").closest("label").classList.toggle("hidden",inc||third||($("#splitPayment").checked&&expense));
 if(inc)$("#cardFields").classList.add("hidden");
 else if(third){$("#splitPayment").checked=false;$("#expensePaymentFields").classList.add("hidden");$("#cardFields").classList.remove("hidden")}
 else {updatePayment();updateSplitPayment()}
}
function openEdit(id){
 const x=loadNorm().find(t=>t.id===id);if(!x)return;editingId=id;$("#expenseForm").reset();$("#expenseDialogTitle").textContent="✏️ EDITAR LANÇAMENTO";$("#editHint").classList.remove("hidden");$("#entryType").value=x.entryType||"EXPENSE";$("#amount").value=x.amount;$("#description").value=(x.description===x.category?"":x.description);$("#date").value=x.date;
 if(x.entryType==="INCOME"){$("#incomeCategory").value=x.incomeCategory||"OUTROS";$("#receivedBy").value=x.receivedBy||"W"}else if(x.entryType==="THIRD_PARTY"){$("#card").value=x.card||"W"}else{$("#group").value=x.group;updateCategories();$("#category").value=x.category;if(hasSplit(x)){$("#splitPayment").checked=true;$("#splitAmountW").value=x.paymentSplit?.W?.amount||"";$("#splitAmountC").value=x.paymentSplit?.C?.amount||"";$("#splitPaymentW").value=x.paymentSplit?.W?.payment||"CARD";$("#splitPaymentC").value=x.paymentSplit?.C?.payment||"CARD";$("#splitCardW").value=x.paymentSplit?.W?.card||"W";$("#splitCardC").value=x.paymentSplit?.C?.card||"C"}else{$("#splitPayment").checked=false;$("#paidBy").value=x.paidBy;$("#payment").value=x.payment;if(x.payment==="CARD")$("#card").value=x.card||"W"}}
 $("#installments").value=1;$("#recurring").checked=false;updateRecurring();updateEntryType();$("#expenseDialog").showModal();
}

$("#fab").onclick=()=>{editingId=null;$("#expenseForm").reset();$("#expenseDialogTitle").textContent="➕ NOVO LANÇAMENTO";$("#editHint").classList.add("hidden");$("#entryType").value="EXPENSE";$("#splitPayment").checked=false;$("#splitAmountW").value="";$("#splitAmountC").value="";$("#date").value=new Date().toISOString().slice(0,10);$("#group").value="CASAL";$("#payment").value="CARD";$("#installments").value=1;let d=new Date();d.setMonth(d.getMonth()+11);$("#recurringUntil").value=mkey(d);updateCategories();updatePayment();updateRecurring();updateEntryType();updateSplitPayment();$("#expenseDialog").showModal()};
$("#closeDialog").onclick=()=>$("#expenseDialog").close();$("#entryType").onchange=updateEntryType;$("#splitPayment").onchange=()=>{updateSplitPayment();updateEntryType()};$("#splitPaymentW").onchange=updateSplitPayment;$("#splitPaymentC").onchange=updateSplitPayment;$("#group").onchange=updateCategories;$("#payment").onchange=updatePayment;$("#recurring").onchange=updateRecurring;$("#filterGroup").onchange=render;$("#chartFilter").onchange=renderChart;$("#prevMonth").onclick=()=>{current.setMonth(current.getMonth()-1);render()};$("#nextMonth").onclick=()=>{current.setMonth(current.getMonth()+1);render()};

$("#expenseForm").onsubmit=async e=>{
 e.preventDefault();
 const type=$("#entryType").value,total=Number($("#amount").value),date=$("#date").value;
 let records=[];

 if(editingId){
   const old=loadNorm().find(x=>x.id===editingId);if(!old)return;
   let u={...old,entryType:type,amount:total,date,competence:date.slice(0,7)};
   if(type==="INCOME")u={...u,description:$("#description").value.trim()||$("#incomeCategory").value,incomeCategory:$("#incomeCategory").value,receivedBy:$("#receivedBy").value,group:null,category:null,paidBy:null,payment:null,card:null,installmentLabel:null,recurringLabel:null};
   else if(type==="THIRD_PARTY")u={...u,description:$("#description").value.trim()||"TERCEIROS",card:$("#card").value,group:null,category:null,paidBy:null,payment:"CARD",incomeCategory:null,receivedBy:null,installmentLabel:null,recurringLabel:null};
   else{
     let paymentSplit=null;
     if($("#splitPayment").checked){
       const w=Number($("#splitAmountW").value||0),c=Number($("#splitAmountC").value||0);
       if(w<=0||c<=0||Math.abs((w+c)-total)>.009){alert("NO PAGAMENTO DIVIDIDO, INFORME VALORES POSITIVOS PARA W E C E FAÇA A SOMA BATER COM O VALOR TOTAL.");return}
       paymentSplit={W:{amount:w,payment:$("#splitPaymentW").value,card:$("#splitPaymentW").value==="CARD"?$("#splitCardW").value:null},C:{amount:c,payment:$("#splitPaymentC").value,card:$("#splitPaymentC").value==="CARD"?$("#splitCardC").value:null}};
     }
     u={...u,description:$("#description").value.trim()||$("#category").value,group:$("#group").value,category:$("#category").value,paymentSplit,paidBy:paymentSplit?null:$("#paidBy").value,payment:paymentSplit?null:$("#payment").value,card:paymentSplit?null:($("#payment").value==="CARD"?$("#card").value:null),incomeCategory:null,receivedBy:null};
   }
   const payload=appToDb(u);delete payload.id;
   setSync("☁️ SALVANDO...");
   const {error}=await db.from("lancamentos").update(payload).eq("id",editingId);
   if(error){alert("Erro ao salvar: "+error.message);setSync("⚠️ ERRO");return}
   editingId=null;$("#expenseDialog").close();current=new Date(date+"T12:00:00");current.setDate(1);await refreshRemote();return;
 }

 if(type==="INCOME")records=[{id:crypto.randomUUID(),purchaseId:crypto.randomUUID(),entryType:type,description:$("#description").value.trim()||$("#incomeCategory").value,incomeCategory:$("#incomeCategory").value,receivedBy:$("#receivedBy").value,amount:total,date,competence:date.slice(0,7)}];
 else if(type==="THIRD_PARTY")records=[{id:crypto.randomUUID(),purchaseId:crypto.randomUUID(),entryType:type,description:$("#description").value.trim()||"TERCEIROS",payment:"CARD",card:$("#card").value,amount:total,date,competence:date.slice(0,7)}];
 else{
   const split=$("#splitPayment").checked;
   let paymentSplit=null;
   if(split){
     const w=Number($("#splitAmountW").value||0),c=Number($("#splitAmountC").value||0);
     if(w<=0||c<=0||Math.abs((w+c)-total)>.009){alert("NO PAGAMENTO DIVIDIDO, INFORME VALORES POSITIVOS PARA W E C E FAÇA A SOMA BATER COM O VALOR TOTAL.");return}
     paymentSplit={W:{amount:w,payment:$("#splitPaymentW").value,card:$("#splitPaymentW").value==="CARD"?$("#splitCardW").value:null},C:{amount:c,payment:$("#splitPaymentC").value,card:$("#splitPaymentC").value==="CARD"?$("#splitCardC").value:null}};
   }
   const isCard=!split&&$("#payment").value==="CARD",n=split?1:(isCard?Math.max(1,Number($("#installments").value||1)):1),rec=split?false:$("#recurring").checked;
   if(rec&&isCard&&n>1){alert("USE PARCELAMENTO OU RECORRÊNCIA, NÃO OS DOIS.");return}
   if(rec&&!$("#recurringUntil").value){alert("INFORME ATÉ QUANDO REPETIR.");return}
   const base={purchaseId:crypto.randomUUID(),entryType:"EXPENSE",description:$("#description").value.trim()||$("#category").value,group:$("#group").value,category:$("#category").value,paymentSplit,paidBy:split?null:$("#paidBy").value,payment:split?null:$("#payment").value,card:isCard?$("#card").value:null},reps=rec?monthsBetween(date,$("#recurringUntil").value):n,cents=Math.round(total*100);
   for(let i=0;i<reps;i++){let d=addMonths(date,i),amount=total,installmentLabel=null,recurringLabel=null;if(!rec&&n>1){let each=Math.floor(cents/n),rem=cents-each*n;amount=(each+(i<rem?1:0))/100;installmentLabel=`${i+1}/${n}`}if(rec)recurringLabel=`MENSAL ${i+1}/${reps}`;records.push({...base,id:crypto.randomUUID(),date:d,competence:d.slice(0,7),amount,installmentLabel,recurringLabel})}
 }
 setSync("☁️ SALVANDO...");
 const {error}=await db.from("lancamentos").insert(records.map(appToDb));
 if(error){alert("Erro ao salvar: "+error.message);setSync("⚠️ ERRO");return}
 $("#expenseDialog").close();current=new Date(date+"T12:00:00");current.setDate(1);await refreshRemote();
};

function csvCell(v){return `"${String(v??"").replace(/"/g,'""')}"`}
function ptDecimal(n){
 const v=Number(n||0);
 if(Number.isInteger(v)) return String(v);
 return v.toFixed(2).replace(".",",");
}
function exportCurrentMonth(){
 const key=mkey(current),d=buildMonth(key),rows=loadNorm().filter(x=>x.competence===key);
 const expenses=rows.filter(x=>x.entryType==="EXPENSE"),incomes=rows.filter(x=>x.entryType==="INCOME"),thirds=rows.filter(x=>x.entryType==="THIRD_PARTY"),hist=d.hist;
 const lines=[["GRUPO","CATEGORIA","W","C","TOTAL"]];let gw=0,gc=0;

 for(const group of ["CONTAS","ALICE","CASAL","WILLIAM","CAROL"]){
   for(const category of EXPORT_ORDER[group]){
     let w=0,c=0;
     const hc=(hist?.categories||[]).filter(x=>x.group===group&&x.category===category);
     for(const h of hc){w+=Number(h.W||0);c+=Number(h.C||0)}
     const items=expenses.filter(x=>x.group===group&&x.category===category);
     for(const x of items){
       if(group==="WILLIAM")w+=Number(x.amount);
       else if(group==="CAROL")c+=Number(x.amount);
       else {w+=paidW(x);c+=paidC(x)}
     }
     gw+=w;gc+=c;lines.push([group,category,ptDecimal(w),ptDecimal(c),ptDecimal(w+c)]);
   }
 }
 lines.push(["TOTAL GASTOS","",ptDecimal(gw),ptDecimal(gc),ptDecimal(gw+gc)]);
 lines.push([]);
 lines.push(["FATURAS","CARTÃO W","CARTÃO C","TOTAL"]);
 lines.push(["FATURAS",ptDecimal(d.cards.W),ptDecimal(d.cards.C),ptDecimal(d.cards.W+d.cards.C)]);
 lines.push([]);
 lines.push(["RECEITAS","CATEGORIA","W","C","TOTAL"]);
 const incCats=["SALARIO","BONUS","REEMBOLSO","VENDA","RESTITUICAO","OUTROS"];
 let iw=0,ic=0;
 for(const cat of incCats){
   let w=0,c=0;
   if(cat==="SALARIO"){w+=Number(hist?.income?.salaryW||0);c+=Number(hist?.income?.salaryC||0)}
   w+=incomes.filter(x=>x.incomeCategory===cat&&x.receivedBy==="W").reduce((s,x)=>s+Number(x.amount),0);
   c+=incomes.filter(x=>x.incomeCategory===cat&&x.receivedBy==="C").reduce((s,x)=>s+Number(x.amount),0);
   iw+=w;ic+=c;lines.push(["RECEITAS",cat,ptDecimal(w),ptDecimal(c),ptDecimal(w+c)]);
 }
 lines.push(["TOTAL RECEITAS","",ptDecimal(iw),ptDecimal(ic),ptDecimal(iw+ic)]);
 lines.push([]);
 const tw=thirds.filter(x=>x.card==="W").reduce((s,x)=>s+Number(x.amount),0),tc=thirds.filter(x=>x.card==="C").reduce((s,x)=>s+Number(x.amount),0);
 lines.push(["TERCEIROS","CARTÃO W","CARTÃO C","TOTAL"],["TERCEIROS",ptDecimal(tw),ptDecimal(tc),ptDecimal(tw+tc)]);
 const csv="\uFEFF"+lines.map(r=>r.map(csvCell).join(";")).join("\r\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download=`contas_${key}.csv`;document.body.appendChild(a);a.click();const url=a.href;a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("#exportMonth").onclick=exportCurrentMonth;


$("#loginForm").onsubmit=async e=>{
 e.preventDefault();
 const box=$("#loginError");
 box.classList.add("hidden");
 box.textContent="";
 const email=$("#loginEmail").value.trim();
 const password=$("#loginPassword").value;
 try{
   const {data,error}=await db.auth.signInWithPassword({email,password});
   if(error){
     console.error("Supabase login error:",error);
     const code=error.code||error.name||"sem_codigo";
     const status=error.status||"sem_status";
     const message=error.message||String(error);
     box.innerHTML=`<strong>LOGIN NÃO REALIZADO</strong><br>Código: ${code}<br>Status: ${status}<br>Mensagem: ${message}`;
     box.classList.remove("hidden");
     return;
   }
   if(!data?.session){
     box.innerHTML="<strong>LOGIN SEM SESSÃO</strong><br>O Supabase não retornou uma sessão autenticada.";
     box.classList.remove("hidden");
   }
 }catch(err){
   console.error("Falha inesperada no login:",err);
   box.innerHTML=`<strong>ERRO INESPERADO</strong><br>${err?.message||String(err)}`;
   box.classList.remove("hidden");
 }
};
$("#logoutBtn").onclick=()=>db.auth.signOut();

function checkMigration(){
 const rows=localLoad().map(x=>normalizeLegacy({...x}));
 if(!rows.length){$("#migrationBanner").classList.add("hidden");return}
 $("#migrationText").textContent=`Este aparelho possui ${rows.length} lançamento(s) locais das versões anteriores.`;
 $("#migrationBanner").classList.remove("hidden");
}
$("#dismissMigrationBtn").onclick=()=>$("#migrationBanner").classList.add("hidden");
$("#migrateLocalBtn").onclick=async()=>{
 const rows=localLoad().map(x=>normalizeLegacy({...x}));
 if(!rows.length)return;
 if(!confirm(`Migrar ${rows.length} lançamento(s) locais para o banco compartilhado?`))return;
 setSync("☁️ MIGRANDO...");
 const {error}=await db.from("lancamentos").upsert(rows.map(appToDb),{onConflict:"id",ignoreDuplicates:true});
 if(error){alert("Erro na migração: "+error.message);setSync("⚠️ ERRO");return}
 localStorage.removeItem(KEY);$("#migrationBanner").classList.add("hidden");await refreshRemote();alert("Migração concluída.");
};

async function handleSession(session){
 currentUser=session?.user||null;
 if(!currentUser){document.body.classList.remove("authenticated");$("#syncBar").classList.add("hidden");remoteRows=[];if(realtimeChannel){db.removeChannel(realtimeChannel);realtimeChannel=null}return}
 document.body.classList.add("authenticated");$("#syncBar").classList.remove("hidden");$("#syncUser").textContent="👤 "+(currentUser.email||"USUÁRIO");
 await refreshRemote();subscribeRealtime();
}
db.auth.onAuthStateChange((event,session)=>handleSession(session));
(async()=>{const {data:{session}}=await db.auth.getSession();await handleSession(session)})();

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
updateCategories();updatePayment();updateRecurring();updateEntryType();updateSplitPayment();
