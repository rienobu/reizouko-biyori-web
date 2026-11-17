// App reminder defaults, not manufacturer use-by dates. Assumes fresh food kept refrigerated.
const foodProfiles={
 chicken:{name:'鶏肉',days:2,icon:'🍗'},pork:{name:'豚肉',days:3,icon:'🥩'},beef:{name:'牛肉',days:3,icon:'🥩'},mince:{name:'ひき肉',days:2,icon:'🥩'},fish:{name:'生魚',days:2,icon:'🐟'},seafood:{name:'えび・いか・貝類',days:2,icon:'🦐'},
 cabbage:{name:'キャベツ',days:7,icon:'🥬'},cutveg:{name:'細かく切った野菜',days:2,icon:'🥬'},leaf:{name:'葉物野菜',days:3,icon:'🥬'},sprouts:{name:'もやし',days:2,icon:'🌱'},mushroom:{name:'きのこ',days:3,icon:'🍄'},root:{name:'にんじん・大根・ごぼう',days:7,icon:'🥕'},potato:{name:'じゃがいも',days:7,icon:'🥔'},onion:{name:'玉ねぎ',days:7,icon:'🧅'},tomato:{name:'トマト',days:5,icon:'🍅'},cucumber:{name:'きゅうり・なす・ピーマン',days:4,icon:'🥒'},broccoli:{name:'ブロッコリー',days:3,icon:'🥦'},egg:{name:'卵',days:7,icon:'🥚'},vegetable:{name:'その他の野菜',days:5,icon:'🥕'},other:{name:'その他・名前を判別できない食材',days:3,icon:'🧺'},meat:{name:'肉・魚（旧分類）',days:2,icon:'🥩'}
};
function detectFoodCategory(name){const n=String(name).normalize('NFKC').toLowerCase();
 for(const [pattern,category] of [[/ひき|挽|ミンチ/,'mince'],[/鶏|とり|チキン|ささみ|ササミ|手羽/,'chicken'],[/豚|ぶた|ポーク/,'pork'],[/牛|ぎゅう|ビーフ/,'beef'],[/えび|エビ|海老|いか|イカ|烏賊|たこ|タコ|あさり|アサリ|しじみ|ほたて|ホタテ|牡蠣|かき|貝/,'seafood'],[/魚|鮭|さけ|サケ|しゃけ|サーモン|鯖|さば|サバ|鰤|ぶり|ブリ|鱈|たら|タラ|鯵|あじ|アジ|鰯|いわし|イワシ|鯛|たい|タイ|さんま|サンマ|まぐろ|マグロ|かつお|カツオ/,'fish'],[/千切り|せん切り|カット野菜|ざく切り/,'cutveg'],[/キャベツ|きゃべつ/,'cabbage'],[/もやし/,'sprouts'],[/ほうれん|小松菜|こまつな|レタス|れたす|白菜|はくさい|水菜|みずな|にら|ニラ/,'leaf'],[/きのこ|キノコ|しめじ|まいたけ|舞茸|えのき|エノキ|しいたけ|椎茸|エリンギ/,'mushroom'],[/にんじん|ニンジン|人参|大根|だいこん|ごぼう|れんこん/,'root'],[/じゃが|ジャガ/,'potato'],[/玉ねぎ|玉葱|たまねぎ|タマネギ/,'onion'],[/トマト|とまと/,'tomato'],[/きゅうり|キュウリ|なす|ナス|茄子|ピーマン/,'cucumber'],[/ブロッコリー|ぶろっこりー/,'broccoli'],[/卵|たまご|玉子/,'egg']])if(pattern.test(n))return category;
 return null;
}
function foodPolicy(name,category='auto'){const key=category==='auto'?(detectFoodCategory(name)||'other'):(foodProfiles[category]?category:'other');return {category:key,...foodProfiles[key]}}
function migrateFoodEstimates(records){let changed=false;for(const item of records){if(item.type!=='food'||item.done||item.explicit||item.policyVersion===2)continue;
 const policy=foodPolicy(item.name,detectFoodCategory(item.name)?'auto':item.category),candidate=plus(item.registered,policy.days);
 item.category=policy.category;item.expiry=item.expiry&&item.expiry<candidate?item.expiry:candidate;
 if(!item.retry)item.notice=plus(item.expiry,-1);item.policyVersion=2;changed=true;
 }return changed}
function updateFoodEstimate(){const p=foodPolicy($('#name').value,$('#category').value);$('#estimatePreview').textContent=`${p.name}：登録から${p.days}日後を使い切り目安に設定します。`;}
function notificationRecipes(item,stock){const name=item.name,n=normalizeRecipe(name),active=stock.filter(x=>!x.done&&x.id!==item.id),stockNames=active.map(x=>normalizeRecipe(x.name));
 const main=detectFoodCategory(name);
 const preferred={chicken:['親子丼','照り焼きチキン'],pork:['しょうが焼き','豚キムチ'],beef:['牛丼','肉豆腐'],mince:['ハンバーグ','そぼろ丼'],cabbage:['野菜炒め','お好み焼き'],leaf:['小松菜の煮浸し','ほうれん草のおひたし'],sprouts:['野菜炒め','豚キムチ'],mushroom:['きのこのバターソテー','鮭のホイル焼き'],egg:['卵焼き','親子丼'],root:['きんぴらごぼう','肉じゃが'],potato:['肉じゃが','ポテトサラダ'],onion:['牛丼','親子丼'],tomato:['鶏肉のトマト煮','鯛のアクアパッツァ'],cucumber:['なすの煮浸し','麻婆なす'],broccoli:['ブロッコリーのガーリック炒め','野菜炒め']};
 const matches=recipeBook.filter(r=>r.ingredients.some(([ingredient])=>{const text=normalizeRecipe(ingredient);return text.includes(n)||n.includes(text)||(['chicken','pork','beef','mince','fish','seafood'].includes(main)&&detectFoodCategory(ingredient)===main&&(!['fish','seafood'].includes(main)||text.includes(n)||n.includes(text)))}));
 const preferredNames=preferred[main]||[];
 const score=r=>r.ingredients.filter(([ingredient])=>stockNames.some(s=>normalizeRecipe(ingredient).includes(s)||s.includes(normalizeRecipe(ingredient)))).length*3+(preferredNames.includes(r.name)?2:0);
 matches.sort((a,b)=>score(b)-score(a));
 return matches.slice(0,2).map(r=>r.name).join('、')||`${name}の炒め物、${name}のスープ`;
}
