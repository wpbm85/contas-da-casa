const CATEGORIES={"CONTAS": ["FINANCIAMENTO", "CONDOMINIO", "IPTU / VAGA", "INTERNET", "COMGAS", "ENEL", "FAXINA", "NETFLIX", "ML/DISNEY", "AMAZON", "SEGURO BOLSA", "SEGURO APTO", "SEGURO CARRO", "IPVA", "OUTROS"], "ALICE": ["ESCOLA", "CONVENIO", "PEDIATRA", "DENTISTA", "ESPORTE", "FARMA/SAÚDE", "ROUPAS", "PRESENTES", "FESTA", "HSP", "PASSEIOS", "OUTROS"], "CASAL": ["CONV ODONTO", "MERCADO", "RESTAURANTES", "CARRO", "PASSEIOS", "FARMÁCIA", "TRANSPORTE", "MANUTENÇÃO", "ROUPAS", "MÓVEIS", "PRESENTES", "VIAGEM", "OUTROS"], "WILLIAM": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"], "CAROL": ["CONVENIO", "CELULAR", "ALIMENTAÇÃO", "PASSEIOS", "TRANSPORTE", "DOCS", "FARMACIA", "COMPRAS", "PRESENTES", "BELEZA", "DENTISTA/MED", "SEGURO", "ESPORTE", "OUTROS"]};
const ICONS={"FINANCIAMENTO": "🏦", "CONDOMINIO": "🏢", "IPTU / VAGA": "🅿️", "INTERNET": "🌐", "COMGAS": "🔥", "ENEL": "⚡", "FAXINA": "🧹", "NETFLIX": "📺", "ML/DISNEY": "📺", "AMAZON": "📦", "SEGURO BOLSA": "👜", "SEGURO APTO": "🏠", "SEGURO CARRO": "🚗", "IPVA": "🚘", "ESCOLA": "🎒", "CONVENIO": "🩺", "PEDIATRA": "👩‍⚕️", "DENTISTA": "🦷", "ESPORTE": "🏃", "FARMA/SAÚDE": "💊", "ROUPAS": "👕", "PRESENTES": "🎁", "FESTA": "🎉", "HSP": "🏥", "CONV ODONTO": "🦷", "MERCADO": "🛒", "RESTAURANTES": "🍽️", "CARRO": "🚗", "PASSEIOS": "🎡", "FARMÁCIA": "💊", "FARMACIA": "💊", "TRANSPORTE": "🚌", "MANUTENÇÃO": "🛠️", "MÓVEIS": "🪑", "VIAGEM": "✈️", "CELULAR": "📱", "ALIMENTAÇÃO": "🥪", "DOCS": "📄", "COMPRAS": "🛍️", "BELEZA": "💇", "DENTISTA/MED": "🩺", "SEGURO": "🛡️", "OUTROS": "📌"};
const GROUP_ICON={CONTAS:"🏠",ALICE:"🧒",CASAL:"💞",WILLIAM:"👨",CAROL:"👩"};
const KEY="contas_pwa_transactions_v1"; let current=new Date(); current.setDate(1); let editingId=null;
const $=s=>document.querySelector(s), money=n=>(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const mkey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const load=()=>JSON.parse(localStorage.getItem(KEY)||"[]"), save=d=>localStorage.setItem(KEY,JSON.stringify(d));
const addMonths=(date,n)=>{let d=new Date(date+"T12:00:00"),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return d.toISOString().slice(0,10)};
const monthsBetween=(start,end)=>{let s=new Date(start+"T12:00:00"),[y,m]=end.split("-").map(Number);return Math.max(1,(y-s.getFullYear())*12+(m-1-s.getMonth())+1)};
function normalizeLegacy(x){ if(x.group==="INDIVIDUAL"){x.group=x.owner==="C"?"CAROL":"WILLIAM"; delete x.owner;} return x; }
function loadNorm(){return load().map(normalizeLegacy)}
function liveForMonth(key){return loadNorm().filter(x=>x.competence===key)}
function buildMonth(key){
 const hist=HISTORICAL_2026[key]||null, live=liveForMonth(key), sum=a=>a.reduce((s,x)=>s+Number(x.amount),0);
 const famLive=live.filter(x=>["CONTAS","ALICE","CASAL"].includes(x.group));
 const family={total:(hist?.family.total||0)+sum(famLive),W:(hist?.family.W||0)+sum(famLive.filter(x=>x.paidBy==="W")),C:(hist?.family.C||0)+sum(famLive.filter(x=>x.paidBy==="C"))};
 const cards={W:(hist?.cards.W||0)+sum(live.filter(x=>x.payment==="CARD"&&x.card==="W")),C:(hist?.cards.C||0)+sum(live.filter(x=>x.payment==="CARD"&&x.card==="C"))};
 const groups={};
 ["CONTAS","ALICE","CASAL","WILLIAM","CAROL"].forEach(g=>{let h=hist?.groups[g]||{W:0,C:0,total:0},gl=live.filter(x=>x.group===g);groups[g]={W:h.W+sum(gl.filter(x=>x.paidBy==="W")),C:h.C+sum(gl.filter(x=>x.paidBy==="C")),total:h.total+sum(gl)}});
 // settlement: family is 50/50; cross-paid personal expenses are reimbursed in full.
 const familyNet=(family.W-family.C)/2;
 const williamPaidByCarol=sum(live.filter(x=>x.group==="WILLIAM"&&x.paidBy==="C"));
 const carolPaidByWilliam=sum(live.filter(x=>x.group==="CAROL"&&x.paidBy==="W"));
 const williamReceives=familyNet + carolPaidByWilliam - williamPaidByCarol;
 const cmap=new Map();
 (hist?.categories||[]).forEach(c=>{
   let k=c.category, v=cmap.get(k)||{category:c.category,total:0,groups:new Set()};
   v.total+=c.total; v.groups.add(c.group); cmap.set(k,v);
 });
 live.forEach(x=>{
   let k=x.category, v=cmap.get(k)||{category:x.category,total:0,groups:new Set()};
   v.total+=Number(x.amount); v.groups.add(x.group); cmap.set(k,v);
 });
 return {hist,live,family,cards,groups,williamReceives,categories:[...cmap.values()].sort((a,b)=>b.total-a.total)};
}
function chartValue(key,filter){
 const d=buildMonth(key);
 if(filter==="FAMILY")return d.family.total;
 if(filter==="CARDS")return d.cards.W+d.cards.C;
 return d.groups[filter]?.total||0;
}
function renderChart(){
 const filter=$("#chartFilter").value;
 const year=current.getFullYear();
 const months=Array.from({length:12},(_,i)=>`${year}-${String(i+1).padStart(2,"0")}`);
 const monthLabels=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
 const data=months.map(k=>chartValue(k,filter));
 const valid=data.map((v,i)=>v>0?i:-1).filter(i=>i>=0);

 // Keep the graph explicitly tied to the year currently being viewed.
 const title=$("#chartYear");
 if(title) title.textContent=String(year);

 if(!valid.length){
   $("#historyChart").innerHTML=`<div class="empty-chart">SEM DADOS PARA ${year} NESTE FILTRO.</div>`;
   return;
 }
 const W=700,H=190,pad=28,max=Math.max(...data);
 const xs=i=>pad+i*(W-2*pad)/11;
 const ys=v=>H-pad-(v/(max||1))*(H-2*pad);

 let pts=valid.map(i=>`${xs(i)},${ys(data[i])}`).join(" ");
 let dots=valid.map(i=>`<circle cx="${xs(i)}" cy="${ys(data[i])}" r="4"></circle><text class="chart-value" x="${xs(i)}" y="${ys(data[i])-8}" text-anchor="middle">${(data[i]/1000).toFixed(1)}k</text>`).join("");
 let labels=months.map((k,i)=>`<text class="chart-label" x="${xs(i)}" y="${H-5}" text-anchor="middle">${monthLabels[i]}</text>`).join("");

 $("#historyChart").innerHTML=`<svg viewBox="0 0 ${W} ${H}" aria-label="Gráfico anual de ${year}"><line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#d5dde4"/><polyline points="${pts}" fill="none" stroke="#526f92" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>${dots}${labels}</svg>`;
}
function render(){
 const key=mkey(current),d=buildMonth(key);
 $("#monthTitle").textContent=current.toLocaleDateString("pt-BR",{month:"long",year:"numeric"}).toUpperCase();
 $("#familyTotal").textContent=money(d.family.total);$("#wPaid").textContent=money(d.family.W);$("#cPaid").textContent=money(d.family.C);
 $("#settlement").textContent=Math.abs(d.williamReceives)<.005?"SEM ACERTO NO MÊS":d.williamReceives>0?`W TEM A RECEBER ${money(d.williamReceives)}`:`C TEM A RECEBER ${money(-d.williamReceives)}`;
 $("#cardW").textContent=money(d.cards.W);$("#cardC").textContent=money(d.cards.C);$("#cardTotal").textContent=money(d.cards.W+d.cards.C);
 $("#totalContas").textContent=money(d.groups.CONTAS.total);$("#totalAlice").textContent=money(d.groups.ALICE.total);$("#totalCasal").textContent=money(d.groups.CASAL.total);$("#totalWilliam").textContent=money(d.groups.WILLIAM.total);$("#totalCarol").textContent=money(d.groups.CAROL.total);
 $("#categoryTotals").innerHTML=d.categories.length?d.categories.map(c=>`<div class="catrow"><div class="catname"><span class="caticon">${ICONS[c.category]||"📌"}</span><span>${c.category.toUpperCase()}<span class="catmeta">${[...c.groups].map(g=>(GROUP_ICON[g]||"•")+" "+g).join(" · ")}</span></span></div><div class="catvalue">${money(c.total)}</div></div>`).join(""):`<div class="mini">SEM GASTOS NESTE MÊS.</div>`;
 $("#historicalNotice").classList.toggle("hidden",!d.hist);
 const filter=$("#filterGroup").value,shown=d.live.filter(x=>!filter||x.group===filter).sort((a,b)=>b.date.localeCompare(a.date));
 $("#transactions").innerHTML=shown.length?shown.map(x=>`<div class="tx"><div><strong>${ICONS[x.category]||"📌"} ${x.description}</strong><div class="meta">${GROUP_ICON[x.group]} ${x.group} · ${x.category} · ${x.date.split("-").reverse().join("/")} · PAGO POR ${x.paidBy} · ${x.payment==="CARD"?"💳 "+x.card:"$"}${x.installmentLabel?" · "+x.installmentLabel:""}${x.recurringLabel?" · 🔁 "+x.recurringLabel:""}</div></div><div class="amount">${money(Number(x.amount))}<div class="tx-actions"><button class="action-btn action-edit" data-edit="${x.id}">✏ EDITAR</button><button class="action-btn action-delete" data-del="${x.id}">🗑 EXCLUIR</button></div></div></div>`).join(""):(d.hist?'<div class="mini">NENHUM LANÇAMENTO NOVO NO APP NESTE MÊS.</div>':'<div class="mini">SEM LANÇAMENTOS NESTE MÊS.</div>');
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openEdit(b.dataset.edit));
 document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{
   if(confirm("Excluir este lançamento?")){
     save(loadNorm().filter(x=>x.id!==b.dataset.del));render();
   }
 });
 renderChart();
}
function orderedCategories(group){
  if(group==="CASAL"){
    const priority={"RESTAURANTES":0,"MERCADO":1,"PASSEIOS":2};
    return [...CATEGORIES[group]].sort((a,b)=>{
      const pa=priority[a] ?? 99, pb=priority[b] ?? 99;
      if(pa!==pb) return pa-pb;
      return a.localeCompare(b,"pt-BR");
    });
  }
  return [...CATEGORIES[group]].sort((a,b)=>a.localeCompare(b,"pt-BR"));
}
function openEdit(id){
  const x=loadNorm().find(t=>t.id===id);
  if(!x) return;
  editingId=id;
  $("#expenseForm").reset();
  $("#expenseDialogTitle").textContent="✏️ EDITAR GASTO";
  $("#editHint").classList.remove("hidden");
  $("#amount").value=x.amount;
  $("#description").value=(x.description===x.category?"":x.description);
  $("#date").value=x.date;
  $("#group").value=x.group;
  updateCategories();
  $("#category").value=x.category;
  $("#paidBy").value=x.paidBy;
  $("#payment").value=x.payment;
  updatePayment();
  if(x.payment==="CARD") $("#card").value=x.card||"W";
  $("#installments").value=1;
  $("#recurring").checked=false;
  updateRecurring();
  $("#expenseDialog").showModal();
}
function updateCategories(){
  let g=$("#group").value, ordered=orderedCategories(g);
  $("#category").innerHTML=ordered.map(c=>`<option value="${c}">${ICONS[c]||"📌"} ${c}</option>`).join("");
  if(g==="CASAL" && ordered.includes("RESTAURANTES")) $("#category").value="RESTAURANTES";
}
function updatePayment(){$("#cardFields").classList.toggle("hidden",$("#payment").value!=="CARD")}
function updateRecurring(){$("#recurringFields").classList.toggle("hidden",!$("#recurring").checked)}
$("#fab").onclick=()=>{
 editingId=null;
 $("#expenseForm").reset();
 $("#expenseDialogTitle").textContent="➕ NOVO GASTO";
 $("#editHint").classList.add("hidden");
 $("#date").value=new Date().toISOString().slice(0,10);
 $("#group").value="CASAL";$("#payment").value="CARD";$("#installments").value=1;
 let d=new Date();d.setMonth(d.getMonth()+11);$("#recurringUntil").value=mkey(d);
 updateCategories();updatePayment();updateRecurring();$("#expenseDialog").showModal()
};
$("#closeDialog").onclick=()=>$("#expenseDialog").close();$("#group").onchange=updateCategories;$("#payment").onchange=updatePayment;$("#recurring").onchange=updateRecurring;$("#filterGroup").onchange=render;$("#chartFilter").onchange=renderChart;
$("#prevMonth").onclick=()=>{current.setMonth(current.getMonth()-1);render()};$("#nextMonth").onclick=()=>{current.setMonth(current.getMonth()+1);render()};
$("#expenseForm").onsubmit=e=>{
 e.preventDefault();
 let total=Number($("#amount").value),isCard=$("#payment").value==="CARD";
 let data=loadNorm();

 if(editingId){
   const idx=data.findIndex(x=>x.id===editingId);
   if(idx<0) return;
   const old=data[idx];
   const date=$("#date").value;
   data[idx]={
     ...old,
     description:($("#description").value.trim()||$("#category").value),
     group:$("#group").value,
     category:$("#category").value,
     paidBy:$("#paidBy").value,
     payment:$("#payment").value,
     card:isCard?$("#card").value:null,
     amount:total,
     date,
     competence:date.slice(0,7)
   };
   save(data);
   editingId=null;
   $("#expenseDialog").close();
   current=new Date(date+"T12:00:00");current.setDate(1);
   render();
   return;
 }

 let n=isCard?Math.max(1,Number($("#installments").value||1)):1,rec=$("#recurring").checked;
 if(rec&&isCard&&n>1){alert("USE PARCELAMENTO OU RECORRÊNCIA, NÃO OS DOIS.");return}
 if(rec&&!$("#recurringUntil").value){alert("INFORME ATÉ QUANDO REPETIR.");return}
 let base={purchaseId:crypto.randomUUID(),description:($("#description").value.trim()||$("#category").value),group:$("#group").value,category:$("#category").value,paidBy:$("#paidBy").value,payment:$("#payment").value,card:isCard?$("#card").value:null},
 reps=rec?monthsBetween($("#date").value,$("#recurringUntil").value):n,cents=Math.round(total*100);
 for(let i=0;i<reps;i++){
   let date=addMonths($("#date").value,i),amount=total,installmentLabel=null,recurringLabel=null;
   if(!rec&&n>1){
     let each=Math.floor(cents/n),rem=cents-each*n;
     amount=(each+(i<rem?1:0))/100;installmentLabel=`${i+1}/${n}`;
   }
   if(rec)recurringLabel=`MENSAL ${i+1}/${reps}`;
   data.push({...base,id:crypto.randomUUID(),date,competence:date.slice(0,7),amount,installmentLabel,recurringLabel});
 }
 save(data);$("#expenseDialog").close();current=new Date($("#date").value+"T12:00:00");current.setDate(1);render()
};


const EXPORT_ORDER={
 CONTAS:["FINANCIAMENTO","CONDOMINIO","IPTU / VAGA","INTERNET","COMGAS","ENEL","FAXINA","NETFLIX","ML/DISNEY","AMAZON","SEGURO BOLSA","SEGURO APTO","SEGURO CARRO","IPVA","OUTROS"],
 ALICE:["ESCOLA","CONVENIO","PEDIATRA","DENTISTA","ESPORTE","FARMA/SAÚDE","ROUPAS","PRESENTES","FESTA","HSP","PASSEIOS","OUTROS"],
 CASAL:["CONV ODONTO","MERCADO","RESTAURANTES","CARRO","PASSEIOS","FARMÁCIA","TRANSPORTE","MANUTENÇÃO","ROUPAS","MÓVEIS","PRESENTES","VIAGEM","OUTROS"],
 WILLIAM:["CONVENIO","CELULAR","ALIMENTAÇÃO","PASSEIOS","TRANSPORTE","DOCS","FARMACIA","COMPRAS","PRESENTES","BELEZA","DENTISTA/MED","SEGURO","ESPORTE","OUTROS"],
 CAROL:["CONVENIO","CELULAR","ALIMENTAÇÃO","PASSEIOS","TRANSPORTE","DOCS","FARMACIA","COMPRAS","PRESENTES","BELEZA","DENTISTA/MED","SEGURO","ESPORTE","OUTROS"]
};
function csvCell(v){return `"${String(v??"").replace(/"/g,'""')}"`;}
function exportCurrentMonth(){
 const key=mkey(current), rows=loadNorm().filter(x=>x.competence===key);
 const lines=[["GRUPO","CATEGORIA","W","C","TOTAL"]];
 for(const group of ["CONTAS","ALICE","CASAL","WILLIAM","CAROL"]){
   for(const category of EXPORT_ORDER[group]){
     const items=rows.filter(x=>x.group===group&&x.category===category);
     if(!items.length) continue;
     let w=0,c=0;
     for(const x of items){
       if(group==="WILLIAM") w+=Number(x.amount);
       else if(group==="CAROL") c+=Number(x.amount);
       else if(x.paidBy==="W") w+=Number(x.amount);
       else c+=Number(x.amount);
     }
     lines.push([group,category,w.toFixed(2),c.toFixed(2),(w+c).toFixed(2)]);
   }
 }
 const csv="\uFEFF"+lines.map(r=>r.map(csvCell).join(";")).join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download=`contas_${key}.csv`;
 document.body.appendChild(a);a.click();
 const url=a.href;a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("#exportMonth").onclick=exportCurrentMonth;

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));updateCategories();updatePayment();updateRecurring();render();