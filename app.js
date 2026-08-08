const CATEGORIES={"CONTAS": ["FINANCIAMENTO", "CONDOMINIO", "IPTU / VAGA", "INTERNET", "COMGAS", "ENEL", "FAXINA", "NETFLIX", "ML/DISNEY", "AMAZON", "SEGURO BOLSA", "SEGURO APTO", "SEGURO CARRO", "IPVA", "OUTROS"], "ALICE": ["ESCOLA", "CONVENIO", "PEDIATRA", "DENTISTA", "ESPORTE", "FARMA/SAÚDE", "ROUPAS", "PRESENTES", "FESTA", "HSP", "PASSEIOS", "OUTROS"], "CASAL": ["CONV ODONTO", "MERCADO", "RESTAURANTES", "CARRO", "PASSEIOS", "FARMÁCIA", "TRANSPORTE", "MANUTENÇÃO", "ROUPAS", "MÓVEIS", "PRESENTES", "VIAGEM", "OUTROS"], "WILLIAM": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"], "CAROL": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"]};
const ICONS={"FINANCIAMENTO": "🏦", "CONDOMINIO": "🏢", "IPTU / VAGA": "🅿️", "INTERNET": "🌐", "COMGAS": "🔥", "ENEL": "⚡", "FAXINA": "🧹", "NETFLIX": "📺", "ML/DISNEY": "📺", "AMAZON": "📦", "SEGURO BOLSA": "👜", "SEGURO APTO": "🏠", "SEGURO CARRO": "🚗", "IPVA": "🚘", "ESCOLA": "🎒", "CONVENIO": "🩺", "PEDIATRA": "👩‍⚕️", "DENTISTA": "🦷", "ESPORTE": "🏃", "FARMA/SAÚDE": "💊", "ROUPAS": "👕", "PRESENTES": "🎁", "FESTA": "🎉", "HSP": "🏥", "CONV ODONTO": "🦷", "MERCADO": "🛒", "RESTAURANTES": "🍽️", "CARRO": "🚗", "PASSEIOS": "🎡", "FARMÁCIA": "💊", "FARMACIA": "💊", "TRANSPORTE": "🚌", "MANUTENÇÃO": "🛠️", "MÓVEIS": "🪑", "VIAGEM": "✈️", "CELULAR": "📱", "ALIMENTAÇÃO": "🥪", "DOCS": "📄", "COMPRAS": "🛍️", "BELEZA": "💇", "DENTISTA/MED": "🩺", "SEGURO": "🛡️", "OUTROS": "📌"};
const EXPORT_ORDER={"CONTAS": ["FINANCIAMENTO", "CONDOMINIO", "IPTU / VAGA", "INTERNET", "COMGAS", "ENEL", "FAXINA", "NETFLIX", "ML/DISNEY", "AMAZON", "SEGURO BOLSA", "SEGURO APTO", "SEGURO CARRO", "IPVA", "OUTROS"], "ALICE": ["ESCOLA", "CONVENIO", "PEDIATRA", "DENTISTA", "ESPORTE", "FARMA/SAÚDE", "ROUPAS", "PRESENTES", "FESTA", "HSP", "PASSEIOS", "OUTROS"], "CASAL": ["CONV ODONTO", "MERCADO", "RESTAURANTES", "CARRO", "PASSEIOS", "FARMÁCIA", "TRANSPORTE", "MANUTENÇÃO", "ROUPAS", "MÓVEIS", "PRESENTES", "VIAGEM", "OUTROS"], "WILLIAM": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"], "CAROL": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"]};
const GROUP_ICON={CONTAS:"🏠",ALICE:"🧒",CASAL:"💞",WILLIAM:"👨",CAROL:"👩"};
const KEY="contas_pwa_transactions_v1";
let current=new Date(); current.setDate(1); let editingId=null;

const $=s=>document.querySelector(s);
const money=n=>(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const mkey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const load=()=>JSON.parse(localStorage.getItem(KEY)||"[]");
const save=d=>localStorage.setItem(KEY,JSON.stringify(d));
const addMonths=(date,n)=>{let d=new Date(date+"T12:00:00"),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return d.toISOString().slice(0,10)};
const monthsBetween=(start,end)=>{let s=new Date(start+"T12:00:00"),[y,m]=end.split("-").map(Number);return Math.max(1,(y-s.getFullYear())*12+(m-1-s.getMonth())+1)};

function normalizeLegacy(x){
 if(x.group==="INDIVIDUAL"){x.group=x.owner==="C"?"CAROL":"WILLIAM";delete x.owner}
 if(!x.entryType)x.entryType="EXPENSE";
 return x;
}
function loadNorm(){return load().map(normalizeLegacy)}
function liveForMonth(key){return loadNorm().filter(x=>x.competence===key)}

function buildMonth(key){
 const hist=HISTORICAL_2026[key]||null,live=liveForMonth(key),sum=a=>a.reduce((s,x)=>s+Number(x.amount),0);
 const expenses=live.filter(x=>x.entryType==="EXPENSE"),incomes=live.filter(x=>x.entryType==="INCOME"),thirdParty=live.filter(x=>x.entryType==="THIRD_PARTY");
 const famLive=expenses.filter(x=>["CONTAS","ALICE","CASAL"].includes(x.group));
 const family={total:(hist?.family.total||0)+sum(famLive),W:(hist?.family.W||0)+sum(famLive.filter(x=>x.paidBy==="W")),C:(hist?.family.C||0)+sum(famLive.filter(x=>x.paidBy==="C"))};
 const ownCardW=(hist?.cards.W||0)+sum(expenses.filter(x=>x.payment==="CARD"&&x.card==="W")),ownCardC=(hist?.cards.C||0)+sum(expenses.filter(x=>x.payment==="CARD"&&x.card==="C"));
 const thirdW=sum(thirdParty.filter(x=>x.card==="W")),thirdC=sum(thirdParty.filter(x=>x.card==="C"));
 const cards={W:ownCardW+thirdW,C:ownCardC+thirdC,ownW:ownCardW,ownC:ownCardC,thirdW,thirdC};
 const groups={};
 ["CONTAS","ALICE","CASAL","WILLIAM","CAROL"].forEach(g=>{let h=hist?.groups[g]||{W:0,C:0,total:0},gl=expenses.filter(x=>x.group===g);groups[g]={W:h.W+sum(gl.filter(x=>x.paidBy==="W")),C:h.C+sum(gl.filter(x=>x.paidBy==="C")),total:h.total+sum(gl)}});
 const familyNet=(family.W-family.C)/2,williamPaidByCarol=sum(expenses.filter(x=>x.group==="WILLIAM"&&x.paidBy==="C")),carolPaidByWilliam=sum(expenses.filter(x=>x.group==="CAROL"&&x.paidBy==="W"));
 const williamReceives=familyNet+carolPaidByWilliam-williamPaidByCarol;
 const cmap=new Map();
 (hist?.categories||[]).forEach(c=>{let v=cmap.get(c.category)||{category:c.category,total:0,groups:new Set()};v.total+=c.total;v.groups.add(c.group);cmap.set(c.category,v)});
 expenses.forEach(x=>{let v=cmap.get(x.category)||{category:x.category,total:0,groups:new Set()};v.total+=Number(x.amount);v.groups.add(x.group);cmap.set(x.category,v)});
 const incomeW=sum(incomes.filter(x=>x.receivedBy==="W")),incomeC=sum(incomes.filter(x=>x.receivedBy==="C")),incomeMap=new Map();
 incomes.forEach(x=>{let k=x.incomeCategory||"OUTROS";incomeMap.set(k,(incomeMap.get(k)||0)+Number(x.amount))});
 const totalExpenses=family.total+groups.WILLIAM.total+groups.CAROL.total;
 return {hist,live,expenses,incomes,thirdParty,family,cards,groups,williamReceives,categories:[...cmap.values()].sort((a,b)=>b.total-a.total),income:{W:incomeW,C:incomeC,total:incomeW+incomeC,byCategory:[...incomeMap.entries()].sort((a,b)=>b[1]-a[1])},totalExpenses};
}

function chartValue(key,filter){
 const d=buildMonth(key);
 if(filter==="FAMILY")return d.family.total;
 if(filter==="CARDS")return d.cards.W+d.cards.C;
 if(filter==="INCOME")return d.income.total;
 if(filter==="SALARY_W")return d.incomes.filter(x=>x.receivedBy==="W"&&x.incomeCategory==="SALARIO").reduce((s,x)=>s+Number(x.amount),0);
 if(filter==="SALARY_C")return d.incomes.filter(x=>x.receivedBy==="C"&&x.incomeCategory==="SALARIO").reduce((s,x)=>s+Number(x.amount),0);
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
 $("#transactions").innerHTML=shown.length?shown.map(x=>{const inc=x.entryType==="INCOME",third=x.entryType==="THIRD_PARTY",icon=inc?"💵":third?"🤝":(ICONS[x.category]||"📌"),meta=inc?`RECEITA · ${incomeNames[x.incomeCategory]||x.incomeCategory} · ${x.date.split("-").reverse().join("/")} · RECEBIDO POR ${x.receivedBy}`:third?`TERCEIROS · ${x.date.split("-").reverse().join("/")} · 💳 ${x.card}`:`${GROUP_ICON[x.group]} ${x.group} · ${x.category} · ${x.date.split("-").reverse().join("/")} · PAGO POR ${x.paidBy} · ${x.payment==="CARD"?"💳 "+x.card:"$ CASH"}${x.installmentLabel?" · "+x.installmentLabel:""}${x.recurringLabel?" · 🔁 "+x.recurringLabel:""}`;return `<div class="tx"><div><strong>${icon} ${x.description}</strong><div class="meta">${meta}</div></div><div class="amount">${money(Number(x.amount))}<div class="tx-actions"><button class="action-btn action-edit" data-edit="${x.id}">✏ EDITAR</button><button class="action-btn action-delete" data-del="${x.id}">🗑 EXCLUIR</button></div></div></div>`}).join(""):`<div class="mini">SEM LANÇAMENTOS NESTE MÊS.</div>`;
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openEdit(b.dataset.edit));document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{if(confirm("Excluir este lançamento?")){save(loadNorm().filter(x=>x.id!==b.dataset.del));render()}});
 renderChart();
}

function orderedCategories(group){
 if(group==="CASAL"){const priority={"RESTAURANTES":0,"MERCADO":1,"PASSEIOS":2};return [...CATEGORIES[group]].sort((a,b)=>{const pa=priority[a]??99,pb=priority[b]??99;if(pa!==pb)return pa-pb;return a.localeCompare(b,"pt-BR")})}
 return [...CATEGORIES[group]].sort((a,b)=>a.localeCompare(b,"pt-BR"));
}
function updateCategories(){let g=$("#group").value,ordered=orderedCategories(g);$("#category").innerHTML=ordered.map(c=>`<option value="${c}">${ICONS[c]||"📌"} ${c}</option>`).join("");if(g==="CASAL")$("#category").value="RESTAURANTES"}
function updatePayment(){$("#cardFields").classList.toggle("hidden",$("#payment").value!=="CARD")}
function updateRecurring(){$("#recurringFields").classList.toggle("hidden",!$("#recurring").checked)}
function updateEntryType(){const type=$("#entryType").value,inc=type==="INCOME",third=type==="THIRD_PARTY";$("#groupLabel").classList.toggle("hidden",inc||third);$("#categoryLabel").classList.toggle("hidden",inc||third);$("#incomeFields").classList.toggle("hidden",!inc);$("#expensePaymentFields").classList.toggle("hidden",inc||third);$("#thirdPartyNote").classList.toggle("hidden",!third);$("#recurring").closest("label").classList.toggle("hidden",inc||third);if(inc)$("#cardFields").classList.add("hidden");else if(third)$("#cardFields").classList.remove("hidden");else updatePayment()}

function openEdit(id){
 const x=loadNorm().find(t=>t.id===id);if(!x)return;editingId=id;$("#expenseForm").reset();$("#expenseDialogTitle").textContent="✏️ EDITAR LANÇAMENTO";$("#editHint").classList.remove("hidden");$("#entryType").value=x.entryType||"EXPENSE";$("#amount").value=x.amount;$("#description").value=(x.description===x.category?"":x.description);$("#date").value=x.date;
 if(x.entryType==="INCOME"){$("#incomeCategory").value=x.incomeCategory||"OUTROS";$("#receivedBy").value=x.receivedBy||"W"}else if(x.entryType==="THIRD_PARTY"){$("#card").value=x.card||"W"}else{$("#group").value=x.group;updateCategories();$("#category").value=x.category;$("#paidBy").value=x.paidBy;$("#payment").value=x.payment;if(x.payment==="CARD")$("#card").value=x.card||"W"}
 $("#installments").value=1;$("#recurring").checked=false;updateRecurring();updateEntryType();$("#expenseDialog").showModal();
}

$("#fab").onclick=()=>{editingId=null;$("#expenseForm").reset();$("#expenseDialogTitle").textContent="➕ NOVO LANÇAMENTO";$("#editHint").classList.add("hidden");$("#entryType").value="EXPENSE";$("#date").value=new Date().toISOString().slice(0,10);$("#group").value="CASAL";$("#payment").value="CARD";$("#installments").value=1;let d=new Date();d.setMonth(d.getMonth()+11);$("#recurringUntil").value=mkey(d);updateCategories();updatePayment();updateRecurring();updateEntryType();$("#expenseDialog").showModal()};
$("#closeDialog").onclick=()=>$("#expenseDialog").close();$("#entryType").onchange=updateEntryType;$("#group").onchange=updateCategories;$("#payment").onchange=updatePayment;$("#recurring").onchange=updateRecurring;$("#filterGroup").onchange=render;$("#chartFilter").onchange=renderChart;$("#prevMonth").onclick=()=>{current.setMonth(current.getMonth()-1);render()};$("#nextMonth").onclick=()=>{current.setMonth(current.getMonth()+1);render()};

$("#expenseForm").onsubmit=e=>{e.preventDefault();const type=$("#entryType").value,total=Number($("#amount").value),date=$("#date").value;let data=loadNorm();
 if(editingId){const idx=data.findIndex(x=>x.id===editingId);if(idx<0)return;const old=data[idx];let u={...old,entryType:type,amount:total,date,competence:date.slice(0,7)};if(type==="INCOME")u={...u,description:$("#description").value.trim()||$("#incomeCategory").value,incomeCategory:$("#incomeCategory").value,receivedBy:$("#receivedBy").value,group:null,category:null,paidBy:null,payment:null,card:null,installmentLabel:null,recurringLabel:null};else if(type==="THIRD_PARTY")u={...u,description:$("#description").value.trim()||"TERCEIROS",card:$("#card").value,group:null,category:null,paidBy:null,payment:"CARD",incomeCategory:null,receivedBy:null,installmentLabel:null,recurringLabel:null};else u={...u,description:$("#description").value.trim()||$("#category").value,group:$("#group").value,category:$("#category").value,paidBy:$("#paidBy").value,payment:$("#payment").value,card:$("#payment").value==="CARD"?$("#card").value:null,incomeCategory:null,receivedBy:null};data[idx]=u;save(data);editingId=null;$("#expenseDialog").close();current=new Date(date+"T12:00:00");current.setDate(1);render();return}
 if(type==="INCOME"){data.push({id:crypto.randomUUID(),purchaseId:crypto.randomUUID(),entryType:type,description:$("#description").value.trim()||$("#incomeCategory").value,incomeCategory:$("#incomeCategory").value,receivedBy:$("#receivedBy").value,amount:total,date,competence:date.slice(0,7)});save(data);$("#expenseDialog").close();current=new Date(date+"T12:00:00");current.setDate(1);render();return}
 if(type==="THIRD_PARTY"){data.push({id:crypto.randomUUID(),purchaseId:crypto.randomUUID(),entryType:type,description:$("#description").value.trim()||"TERCEIROS",payment:"CARD",card:$("#card").value,amount:total,date,competence:date.slice(0,7)});save(data);$("#expenseDialog").close();current=new Date(date+"T12:00:00");current.setDate(1);render();return}
 const isCard=$("#payment").value==="CARD",n=isCard?Math.max(1,Number($("#installments").value||1)):1,rec=$("#recurring").checked;if(rec&&isCard&&n>1){alert("USE PARCELAMENTO OU RECORRÊNCIA, NÃO OS DOIS.");return}if(rec&&!$("#recurringUntil").value){alert("INFORME ATÉ QUANDO REPETIR.");return}
 let base={purchaseId:crypto.randomUUID(),entryType:"EXPENSE",description:$("#description").value.trim()||$("#category").value,group:$("#group").value,category:$("#category").value,paidBy:$("#paidBy").value,payment:$("#payment").value,card:isCard?$("#card").value:null},reps=rec?monthsBetween(date,$("#recurringUntil").value):n,cents=Math.round(total*100);for(let i=0;i<reps;i++){let d=addMonths(date,i),amount=total,installmentLabel=null,recurringLabel=null;if(!rec&&n>1){let each=Math.floor(cents/n),rem=cents-each*n;amount=(each+(i<rem?1:0))/100;installmentLabel=`${i+1}/${n}`}if(rec)recurringLabel=`MENSAL ${i+1}/${reps}`;data.push({...base,id:crypto.randomUUID(),date:d,competence:d.slice(0,7),amount,installmentLabel,recurringLabel})}save(data);$("#expenseDialog").close();current=new Date(date+"T12:00:00");current.setDate(1);render();
};

function csvCell(v){return `"${String(v??"").replace(/"/g,'""')}"`}
function ptDecimal(n){
 const v=Number(n||0);
 if(Number.isInteger(v)) return String(v);
 return v.toFixed(2).replace(".",",");
}
function exportCurrentMonth(){const key=mkey(current),rows=loadNorm().filter(x=>x.competence===key),expenses=rows.filter(x=>x.entryType==="EXPENSE"),incomes=rows.filter(x=>x.entryType==="INCOME"),thirds=rows.filter(x=>x.entryType==="THIRD_PARTY"),lines=[["GRUPO","CATEGORIA","W","C","TOTAL"]];let gw=0,gc=0;
 for(const group of ["CONTAS","ALICE","CASAL","WILLIAM","CAROL"])for(const category of EXPORT_ORDER[group]){const items=expenses.filter(x=>x.group===group&&x.category===category);let w=0,c=0;for(const x of items){if(group==="WILLIAM")w+=Number(x.amount);else if(group==="CAROL")c+=Number(x.amount);else if(x.paidBy==="W")w+=Number(x.amount);else c+=Number(x.amount)}gw+=w;gc+=c;lines.push([group,category,ptDecimal(w),ptDecimal(c),ptDecimal(w+c)])}
 lines.push(["TOTAL GASTOS","",ptDecimal(gw),ptDecimal(gc),ptDecimal(gw+gc)],[],["RECEITAS","CATEGORIA","W","C","TOTAL"]);const incCats=["SALARIO","BONUS","REEMBOLSO","VENDA","RESTITUICAO","OUTROS"];let iw=0,ic=0;for(const cat of incCats){let w=incomes.filter(x=>x.incomeCategory===cat&&x.receivedBy==="W").reduce((s,x)=>s+Number(x.amount),0),c=incomes.filter(x=>x.incomeCategory===cat&&x.receivedBy==="C").reduce((s,x)=>s+Number(x.amount),0);iw+=w;ic+=c;lines.push(["RECEITAS",cat,ptDecimal(w),ptDecimal(c),ptDecimal(w+c)])}
 lines.push(["TOTAL RECEITAS","",ptDecimal(iw),ptDecimal(ic),ptDecimal(iw+ic)],[]);const tw=thirds.filter(x=>x.card==="W").reduce((s,x)=>s+Number(x.amount),0),tc=thirds.filter(x=>x.card==="C").reduce((s,x)=>s+Number(x.amount),0);lines.push(["TERCEIROS","CARTÃO W","CARTÃO C","TOTAL"],["TERCEIROS",ptDecimal(tw),ptDecimal(tc),ptDecimal(tw+tc)]);
 const csv="\uFEFF"+lines.map(r=>r.map(csvCell).join(";")).join("\r\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`contas_${key}.csv`;document.body.appendChild(a);a.click();const url=a.href;a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("#exportMonth").onclick=exportCurrentMonth;

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
updateCategories();updatePayment();updateRecurring();updateEntryType();render();
