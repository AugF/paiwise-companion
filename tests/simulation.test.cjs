const assert=require('node:assert/strict');
const E=require('../simulation-engine.js');
for(const game of Object.keys(E.rules)){
 for(const policy of ['recommended','first','last']){
  let s=E.create(game),steps=0;
  while(!s.done&&steps<100){const a=E.actions(s);assert.ok(a.length,game+' deadlock');const chosen=policy==='recommended'?E.recommend(s):policy==='first'?a[0]:a.at(-1);const before=JSON.stringify(s);const next=E.step(s,chosen.id);assert.equal(JSON.stringify(s),before,'input mutated');assert.equal(next.seq,s.seq+1);assert.ok(next.hp>=0);if(game==='spire')assert.ok(next.energy>=0);s=next;steps++}
  assert.ok(s.done,game+' failed to terminate '+policy);assert.equal(E.actions(s).length,0);assert.throws(()=>E.step(s,'end'));assert.ok(s.result);
 }
}
let s=E.create('sanguosha');s=E.step(s,'attack');assert.throws(()=>E.step(s,'attack'));s=E.step(s,'end');const hp=s.hp;s=E.step(s,'dodge');assert.equal(s.hp,hp);assert.equal(s.turn,2);
s=E.create('spire');s=E.step(s,'card:4');assert.equal(s.energy,1);s=E.step(s,'card:0');assert.equal(s.energy,0);assert.equal(E.actions(s).length,1);s=E.step(s,'end');assert.equal(s.energy,3);
s=E.create('guandan');assert.throws(()=>E.step(s,'pair:5'));s=E.step(s,'pair:8');assert.ok(!s.hand.includes('8'));assert.equal(s.hand.length,6);
s=E.create('mahjong');s=E.step(s,'discard:13');assert.equal(s.hand.length,14);assert.equal(s.discards[0],'白');
function chess(s){if(s.done)return 1;let paths=0;for(const a of E.actions(s)){const next=E.step(s,a.id);assert.equal(Object.keys(next.board).length,32);assert.equal(Object.values(next.board).filter(p=>p==='K').length,1);paths+=chess(next)}return paths}assert.equal(chess(E.create('chess')),8);
for(const game of Object.keys(E.rules)){let s=E.create(game);assert.throws(()=>E.step(s,'not-a-move'))}
console.log('PASS: 6 engines × 3 policies, 8 chess branches, legality, resource and terminal-state checks');
