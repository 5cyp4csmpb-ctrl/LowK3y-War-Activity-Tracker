// ==UserScript==
// @name         LowK3y War Activity Tracker
// @namespace    https://github.com/5cyp4csmpb-ctrl
// @version      0.1.0
// @description  Universal Torn faction war score tracker (read-only prototype)
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @connect      api.torn.com
// @updateURL    https://raw.githubusercontent.com/5cyp4csmpb-ctrl/LowK3y-War-Activity-Tracker/main/lowk3y-war-activity-tracker.user.js
// @downloadURL  https://raw.githubusercontent.com/5cyp4csmpb-ctrl/LowK3y-War-Activity-Tracker/main/lowk3y-war-activity-tracker.user.js
// ==/UserScript==
(function(){
'use strict';
if(document.getElementById('lowk3y-wat-launch'))return;
const prefix='lowk3y-wat-',api='https://api.torn.com/v2';
const el=(tag,attrs={},children=[])=>{const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>{if(k==='text')n.textContent=v;else if(k==='style')Object.assign(n.style,v);else n.setAttribute(k,v)});children.forEach(c=>n.append(c));return n};
const button=el('button',{id:prefix+'launch',text:'⚔️ War Tracker',style:{position:'fixed',right:'12px',bottom:'95px',zIndex:'999999',background:'#13263c',color:'#fff',border:'1px solid #c99d4c',borderRadius:'12px',padding:'12px',fontWeight:'bold',touchAction:'none'}});
document.body.append(button);
let dragging=false,start=null;
button.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,left:button.offsetLeft,top:button.offsetTop};dragging=false;button.setPointerCapture(e.pointerId)});
button.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)>8)dragging=true;if(dragging){button.style.left=Math.max(0,Math.min(innerWidth-button.offsetWidth,start.left+dx))+'px';button.style.top=Math.max(0,Math.min(innerHeight-button.offsetHeight,start.top+dy))+'px';button.style.right='auto';button.style.bottom='auto'}});
button.addEventListener('pointerup',()=>{start=null});
const panel=el('div',{style:{position:'fixed',zIndex:'999998',inset:'8% 3% auto',maxHeight:'80vh',overflow:'auto',background:'#101e30',color:'#fff',border:'1px solid #c99d4c',borderRadius:'14px',padding:'16px',font:'14px system-ui',display:'none'}});
document.body.append(panel);
const heading=el('h2',{text:'⚔️ LowK3y War Tracker'}),close=el('button',{text:'✕ Close'}),key=el('input',{type:'password',placeholder:'Torn API key'}),fid=el('input',{placeholder:'Faction ID',inputmode:'numeric'}),load=el('button',{text:'Load wars'}),war=el('select'),report=el('button',{text:'View war report'}),status=el('p'),table=el('div');
[close,key,fid,load,war,report].forEach(x=>Object.assign(x.style,{margin:'5px',padding:'9px',maxWidth:'95%'}));
panel.append(heading,close,el('p',{text:'Read-only prototype. API key stays in memory until page reload; never share it.'}),key,fid,load,war,report,status,table);
close.onclick=()=>panel.style.display='none';button.addEventListener('click',()=>{if(!dragging)panel.style.display=panel.style.display==='none'?'block':'none'});
function request(path){return new Promise((resolve,reject)=>{if(!key.value.trim())return reject(Error('Enter your API key'));GM_xmlhttpRequest({method:'GET',url:api+path,headers:{Authorization:'ApiKey '+key.value.trim()},onload:r=>{try{const j=JSON.parse(r.responseText);if(j.error)throw Error(j.error.error||'Torn API error');resolve(j)}catch(e){reject(e)}},onerror:()=>reject(Error('Network error'))})})}
const entries=x=>Array.isArray(x)?x:Object.entries(x||{}).map(([id,v])=>({...v,id:v.id??id}));
load.onclick=async()=>{try{if(!/^\d+$/.test(fid.value.trim()))throw Error('Enter numeric faction ID');status.textContent='Loading…';const d=await request('/faction/'+fid.value.trim()+'/rankedwars?limit=100');war.replaceChildren();entries(d.rankedwars).forEach(w=>war.append(el('option',{value:String(w.id),text:'War '+w.id})));status.textContent=war.options.length+' wars found';}catch(e){status.textContent=e.message}};
report.onclick=async()=>{try{if(!war.value)throw Error('Select a war');status.textContent='Loading report…';const d=await request('/faction/'+war.value+'/rankedwarreport');const f=entries(d.factions).find(x=>String(x.id??x.faction_id)===fid.value.trim());if(!f)throw Error('Faction not found in report');const members=entries(f.members||f.players||f.participants);if(!members.length)throw Error('Individual scores unavailable or report format changed');members.sort((a,b)=>Number(b.score??b.war_score??0)-Number(a.score??a.war_score??0));table.replaceChildren();members.forEach((m,i)=>table.append(el('p',{text:(i+1)+'. '+(m.name||m.player_name||m.id)+' — '+(m.score??m.war_score??0)+' score'})));status.textContent='Showing reported members only; missing scores do not prove inactivity.'}catch(e){status.textContent=e.message}};
})();