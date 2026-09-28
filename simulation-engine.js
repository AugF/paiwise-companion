/* Small deterministic teaching games. No claims of complete official rules. */
(function(root){
const rules={
 sanguosha:'基础牌攻防练习：杀每回合一次，闪抵挡杀，桃回复 1 点体力。固定对手、最多 4 回合；不含身份、武将技能、装备和完整濒死流程。',
 guandan:'跟牌练习：本片段只使用普通对子，按 3 至 A 比大小。固定打 2，手中无级牌或逢人配；不含炸弹、进贡和升级结算。',
 mahjong:'摸打一张练习：固定 14 张手牌，每次打出一张后进入下一次摸牌。共 3 次选择；不含吃碰杠、胡牌与番数计算。',
 spire:'简化战斗：每回合 3 点能量，打击造成 6 伤害、防御获得 5 格挡、重击造成 9 伤害并消耗 2 能量。固定抽牌与敌人意图，不含遗物、易伤与地图。',
 chess:'开局分支练习：选择预设合法走法，黑方自动回应。每条线路 3 个白方回合，不是完整棋力引擎，也不判断整局胜负。',
 custom:'通用回合沙盘：进攻消耗 2 资源并推进 2 点，防守消耗 1 资源抵挡反击，休整恢复 2 资源。共 4 回合；这是自定义模板，不代表所填游戏的真实规则。'
};
const openings={
 root:[['e2','e4','e7','e5','王兵开局','e4'],['d2','d4','d7','d5','后兵开局','d4']],
 e4:[['g1','f3','b8','c6','出马 Nf3','e4n'],['f1','c4','b8','c6','出象 Bc4','e4b']],
 d4:[['c2','c4','e7','e6','推进 c4','d4c'],['g1','f3','g8','f6','出马 Nf3','d4n']],
 e4n:[['f1','c4','f8','c5','出象 Bc4','end'],['b1','c3','g8','f6','出马 Nc3','end']],
 e4b:[['g1','f3','g8','f6','出马 Nf3','end'],['d2','d3','f8','c5','推进 d3','end']],
 d4c:[['b1','c3','g8','f6','出马 Nc3','end'],['e2','e3','g8','f6','推进 e3','end']],
 d4n:[['c2','c4','e7','e6','推进 c4','end'],['e2','e3','e7','e6','推进 e3','end']]
};
function board(){const b={};'abcdefgh'.split('').forEach((f,i)=>{b[f+'1']='RNBQKBNR'[i];b[f+'2']='P';b[f+'7']='p';b[f+'8']='rnbqkbnr'[i]});return b}
function create(game){if(!rules[game])throw Error('Unknown simulation');const s={game,turn:1,seq:0,done:false,result:'',log:[],hand:[],table:[],hp:4,enemy:3,phase:'action'};
 if(game==='sanguosha')Object.assign(s,{hp:3,hand:['杀','杀','闪','桃'],maxTurns:4});
 if(game==='spire')Object.assign(s,{hp:30,enemy:26,energy:3,block:0,hand:['打击','打击','防御','防御','重击'],maxTurns:4});
 if(game==='guandan')Object.assign(s,{hand:['8','8','10','10','A','A','5','5'],table:['7','7'],maxTurns:3});
 if(game==='mahjong')Object.assign(s,{hand:['一万','二万','三万','四万','五万','六万','二筒','三筒','四筒','七条','八条','九条','东','白'],maxTurns:3,discards:[]});
 if(game==='chess')Object.assign(s,{board:board(),node:'root',maxTurns:3});
 if(game==='custom')Object.assign(s,{hp:6,resource:5,progress:0,maxTurns:4});
 return s;
}
const action=(id,label,hint)=>({id,label,hint});
function actions(s){if(s.done)return[];
 if(s.game==='sanguosha'){
  if(s.phase==='defend')return [...(s.hand.includes('闪')?[action('dodge','打出闪','抵挡这一次杀')]:[]),action('take','承受伤害','失去 1 点体力，保留手牌')];
  return [...(s.hand.includes('杀')&&!s.attacked?[action('attack','对对手使用杀','本回合限一次，对方首回合持有一张闪')]:[]),...(s.hand.includes('桃')&&s.hp<4?[action('heal','使用桃','回复 1 点体力')]:[]),action('end','结束出牌','对手将使用杀')];
 }
 if(s.game==='spire')return [...s.hand.map((c,i)=>({c,i})).filter(({c})=>s.energy>=(c==='重击'?2:1)).map(({c,i})=>action('card:'+i,'使用'+c,`消耗 ${c==='重击'?2:1} 能量`)),action('end','结束回合','敌人攻击，之后补满能量并抽取固定手牌')];
 if(s.game==='guandan'){const ranks=['3','4','5','6','7','8','9','10','J','Q','K','A'];return [...[...new Set(s.hand)].filter(r=>s.hand.filter(x=>x===r).length>=2&&(!s.table.length||ranks.indexOf(r)>ranks.indexOf(s.table[0]))).map(r=>action('pair:'+r,'出对 '+r,'打出这两张牌')),...(s.table.length?[action('pass','不出','保留手牌，进入下一次预置局面')]:[])];}
 if(s.game==='mahjong')return s.hand.map((c,i)=>action('discard:'+i,'打出'+c,'打出一张，观察下一次摸牌'));
 if(s.game==='chess')return openings[s.node].map((m,i)=>action('move:'+i,m[4],m[0]+' → '+m[1]));
 return [ ...(s.resource>=2?[action('attack','进攻','消耗 2 资源，推进 2 点；受到 1 点反击')]:[]),...(s.resource>=1?[action('guard','防守','消耗 1 资源，抵挡本回合反击')]:[]),action('rest','休整','恢复 2 资源；受到 1 点反击')];
}
function recommend(s){const a=actions(s);if(!a.length)return null;let id;
 if(s.game==='sanguosha')id=s.phase==='defend'?'dodge':s.hp<=2&&s.hand.includes('桃')?'heal':'attack';
 if(s.game==='spire')id=(s.energy&&s.block<intent(s)?a.find(x=>x.label==='使用防御'):a.find(x=>x.label==='使用打击'))?.id;
 if(s.game==='mahjong')id='discard:'+Math.max(0,s.hand.indexOf('白')>=0?s.hand.indexOf('白'):s.hand.indexOf('东'));
 if(s.game==='custom')id=s.hp<=2?'guard':s.resource>=2?'attack':'rest';
 return a.find(x=>x.id===id)||a[0];
}
function intent(s){return [6,9,7,10][s.turn-1]||10}
function step(s,id){const valid=actions(s).find(a=>a.id===id);if(!valid)throw Error('当前局面不允许这个动作');const n=JSON.parse(JSON.stringify(s));n.seq++;const notes=[valid.label];const remove=c=>n.hand.splice(n.hand.indexOf(c),1);const finish=t=>{n.done=true;n.result=t};
 if(n.game==='sanguosha'){
  if(id==='attack'){remove('杀');n.attacked=true;if(n.turn===1){notes.push('对手打出闪，本次杀被抵挡')}else{n.enemy--;notes.push('对手失去 1 点体力')}}
  if(id==='heal'){remove('桃');n.hp++;notes.push('回复 1 点体力')}
  if(id==='end'){n.phase='defend';n.table=['对手使用杀'];notes.push('对手使用杀，轮到你响应')}
  if(id==='dodge'||id==='take'){if(id==='dodge'){remove('闪');notes.push('成功抵挡')}else{n.hp--;notes.push('你失去 1 点体力')};if(n.hp<=0)finish('体力耗尽，本次攻防练习结束');else if(n.turn===n.maxTurns)finish('四回合练习完成，你存活下来');else{n.turn++;n.phase='action';n.attacked=false;n.hand.push('杀',n.turn%2?'桃':'闪');n.table=[];notes.push('进入你的回合，摸两张预置牌')}}
  if(n.enemy<=0)finish('对手体力耗尽，本次攻防练习完成');
 }
 if(n.game==='spire'){
  if(id.startsWith('card:')){const c=n.hand.splice(Number(id.split(':')[1]),1)[0];n.energy-=c==='重击'?2:1;if(c==='防御')n.block+=5;else n.enemy-=c==='重击'?9:6;notes.push(c==='防御'?'获得 5 格挡':'造成 '+(c==='重击'?9:6)+' 点伤害');if(n.enemy<=0){n.enemy=0;finish('击败训练敌人，战斗结束')}}
  else{const damage=Math.max(0,intent(n)-n.block);n.hp-=damage;notes.push('敌人攻击，你受到 '+damage+' 点伤害');n.block=0;if(n.hp<=0){n.hp=0;finish('生命耗尽，战斗结束')}else if(n.turn===n.maxTurns)finish('四回合训练结束，敌人尚未被击败');else{n.turn++;n.energy=3;n.hand=['打击','防御','打击','重击','防御']}}
 }
 if(n.game==='guandan'){if(id.startsWith('pair:')){remove(id.slice(5));remove(id.slice(5))}notes.push('其余座位动作按教学脚本推进');if(n.turn===3||!n.hand.length)finish('跟牌片段完成，未模拟整局名次');else{n.turn++;n.table=n.turn===2?['9','9']:[];notes.push(n.table.length?'下次桌面为对 9':'下次局面由你领出')}}
 if(n.game==='mahjong'){const c=n.hand.splice(Number(id.split(':')[1]),1)[0];n.discards.push(c);n.table=[...n.discards];if(n.turn===3)finish('三次摸打完成，未计算胡牌与番数');else{const draw=n.turn===1?'东':'九万';n.turn++;n.hand.push(draw);notes.push('其他三家依次出牌，轮到你摸到'+draw)}}
 if(n.game==='chess'){const m=openings[n.node][Number(id.split(':')[1])];for(const [from,to] of [[m[0],m[1]],[m[2],m[3]]]){n.board[to]=n.board[from];delete n.board[from]}n.table=[m[0]+' → '+m[1],m[2]+' → '+m[3]];notes.push('黑方回应 '+m[2]+' → '+m[3]);n.node=m[5];if(n.node==='end')finish('开局片段完成，未判断整局胜负');else n.turn++}
 if(n.game==='custom'){if(id==='attack'){n.resource-=2;n.progress+=2;n.hp--}if(id==='guard')n.resource--;if(id==='rest'){n.resource=Math.min(8,n.resource+2);n.hp--}notes.push(`资源 ${n.resource}，生命 ${n.hp}，推进 ${n.progress}`);if(n.hp<=0)finish('生命耗尽，沙盘结束');else if(n.turn===4)finish('四回合沙盘结束，累计推进 '+n.progress+' 点');else n.turn++}
 n.log.push({turn:s.turn,action:valid.label,text:notes.join(' · ')});return n;
}
const api={rules,create,actions,recommend,step,intent};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SimEngine=api;
})(typeof globalThis==='undefined'?this:globalThis);
