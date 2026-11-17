const recipeBook = [
 {name:'親子丼',aliases:['おやこどん'],icon:'🍚',minutes:20,ingredients:[['鶏もも肉','150g'],['卵','2個'],['玉ねぎ','1/2個'],['ご飯','2膳'],['だし汁','100ml'],['しょうゆ','大さじ1と1/2'],['みりん','大さじ1と1/2'],['砂糖','小さじ1']],steps:['玉ねぎは薄切り、鶏肉はひと口大に切る。','フライパンにだし汁・しょうゆ・みりん・砂糖・玉ねぎを入れて煮立て、鶏肉を加えて中心まで火を通す。','溶き卵を回し入れ、ふたをして好みの固さまで加熱する。ご飯にのせる。']},
 {name:'照り焼きチキン',aliases:['てりやき','照焼き','照り焼き'],icon:'🍗',minutes:20,ingredients:[['鶏もも肉','1枚（約300g）'],['しょうゆ','大さじ1と1/2'],['みりん','大さじ1と1/2'],['酒','大さじ1'],['砂糖','小さじ2'],['油','小さじ1']],steps:['鶏肉の厚い部分を開き、厚みをそろえる。調味料を混ぜる。','油を熱したフライパンで皮側から焼き、裏返してふたをし、中心までしっかり火を通す。','余分な脂を拭き、調味料を加える。煮詰めながら両面にたれを絡め、切り分ける。']},
 {name:'肉じゃが',aliases:['にくじゃが'],icon:'🥔',minutes:30,ingredients:[['牛こま肉または豚こま肉','150g'],['じゃがいも','2個'],['玉ねぎ','1/2個'],['にんじん','1/2本'],['だし汁','250ml'],['しょうゆ','大さじ2'],['みりん','大さじ2'],['砂糖','大さじ1'],['油','小さじ2']],steps:['野菜をひと口大に切る。鍋に油を熱し、肉を炒め、野菜を加える。','だし汁と調味料を入れ、煮立ったらアクを取る。','落としぶたをして弱めの中火で15〜20分、肉に火が通り、じゃがいもがやわらかくなるまで煮る。']},
 {name:'野菜炒め',aliases:['やさいいため'],icon:'🥬',minutes:15,ingredients:[['キャベツ','150g'],['にんじん','1/3本'],['もやし','100g'],['豚こま肉','100g'],['油','小さじ2'],['しょうゆ','小さじ2'],['塩・こしょう','少々']],steps:['野菜と豚肉を食べやすく切る。','フライパンに油を熱し、豚肉を炒める。にんじん、キャベツ、もやしの順に加える。','肉にしっかり火が通り、野菜がしんなりしたら、しょうゆ・塩・こしょうで味を調える。']},
 {name:'お好み焼き',aliases:['おこのみやき'],icon:'🥞',minutes:25,ingredients:[['キャベツ','200g'],['豚薄切り肉','100g'],['卵','1個'],['薄力粉','100g'],['だし汁','100ml'],['油','小さじ2'],['お好み焼きソース・マヨネーズ','適量']],steps:['キャベツを粗みじん切りにする。薄力粉・だし汁・卵を混ぜ、キャベツを加える。','油を熱したフライパンに生地を2枚に分けて丸く広げ、豚肉をのせて中火で焼く。','裏返してふたをし、肉と生地の中心まで火を通す。ソース・マヨネーズをかける。']},
 {name:'鶏肉と卵の炒め物',aliases:['とりにくとたまごのいためもの'],icon:'🍳',minutes:20,ingredients:[['鶏もも肉','200g'],['卵','2個'],['しょうゆ','小さじ2'],['酒','大さじ1'],['油','小さじ2'],['塩・こしょう','少々']],steps:['鶏肉を小さく切り、卵を溶く。','油の半量を熱して卵を炒め、いったん取り出す。残りの油で鶏肉を炒め、酒を加えてふたをし中心まで火を通す。','卵を戻し、しょうゆ・塩・こしょうで味を調える。']},
 {name:'豚肉とキャベツの炒め物',aliases:['ぶたにくときゃべつのいためもの','キャベツ炒め'],icon:'🥬',minutes:15,ingredients:[['豚こま肉','200g'],['キャベツ','200g'],['油','小さじ2'],['しょうゆ','大さじ1'],['酒','大さじ1'],['塩・こしょう','少々']],steps:['豚肉とキャベツを食べやすく切る。','油を熱したフライパンで豚肉を炒め、キャベツを加える。','酒を加え、豚肉にしっかり火が通るまで炒める。しょうゆ・塩・こしょうで味を調える。']},
 {name:'重ね蒸し',aliases:['かさねむし','豚肉とキャベツの重ね蒸し'],icon:'🥘',minutes:20,ingredients:[['豚薄切り肉','200g'],['キャベツ','250g'],['酒','大さじ2'],['水','大さじ3'],['ポン酢','適量']],steps:['キャベツをざく切りにする。','フライパンにキャベツと豚肉を交互に重ね、酒と水を加える。','ふたをして弱めの中火で蒸し、豚肉の中心まで火を通す。途中で水分が足りなければ水を足し、仕上げにポン酢を添える。']},
 {name:'キャベツの卵炒め',aliases:['きゃべつのたまごいため'],icon:'🍳',minutes:10,ingredients:[['キャベツ','200g'],['卵','2個'],['油','小さじ2'],['しょうゆ','小さじ2'],['塩・こしょう','少々']],steps:['キャベツをざく切りにし、卵を溶く。','油の半量で卵を炒めて取り出す。残りの油でキャベツを炒める。','キャベツがしんなりしたら卵を戻し、しょうゆ・塩・こしょうで味を調える。']},
 {name:'卵焼き',aliases:['たまごやき','玉子焼き'],icon:'🥚',minutes:10,ingredients:[['卵','3個'],['砂糖','小さじ2'],['しょうゆ','小さじ1/2'],['水','大さじ2'],['油','適量']],steps:['卵を溶き、砂糖・しょうゆ・水を混ぜる。','卵焼き器に薄く油を引き、卵液の1/3を流して広げ、固まり始めたら巻く。','油を薄く引き直し、残りの卵液を2回に分けて加えて巻く。中まで火を通して切り分ける。']},
 {name:'卵スープ',aliases:['たまごすーぷ','玉子スープ'],icon:'🥣',minutes:10,ingredients:[['卵','1個'],['水','400ml'],['鶏がらスープの素','小さじ2'],['しょうゆ','小さじ1'],['ごま油','少々'],['小ねぎ','適量']],steps:['鍋に水・鶏がらスープの素・しょうゆを入れて煮立てる。','溶き卵を細く回し入れ、固まってから軽く混ぜる。','ごま油と刻んだ小ねぎを加える。']},
 {name:'しょうが焼き',aliases:['生姜焼き','しょうがやき','豚の生姜焼き'],icon:'🥩',minutes:15,ingredients:[['豚薄切り肉','200g'],['玉ねぎ','1/2個'],['おろししょうが','小さじ2'],['しょうゆ','大さじ1と1/2'],['みりん','大さじ1'],['酒','大さじ1'],['油','小さじ2']],steps:['玉ねぎを薄切りにし、しょうがと調味料を混ぜる。','フライパンに油を熱し、豚肉と玉ねぎを炒める。','豚肉にしっかり火が通ったら合わせ調味料を加え、絡める。']},
 {name:'豚丼',aliases:['ぶたどん'],icon:'🍚',minutes:15,ingredients:[['豚薄切り肉','200g'],['玉ねぎ','1/2個'],['ご飯','2膳'],['水','100ml'],['しょうゆ','大さじ2'],['みりん','大さじ2'],['砂糖','小さじ2']],steps:['玉ねぎを薄切りにする。','フライパンに水と調味料を煮立て、玉ねぎと豚肉を加える。','肉にしっかり火が通り、玉ねぎがやわらかくなるまで煮て、ご飯にのせる。']},
 {name:'蒸しキャベツ',aliases:['むしきゃべつ'],icon:'🥬',minutes:10,ingredients:[['キャベツ','250g'],['水','大さじ3'],['ポン酢','大さじ1'],['ごま油','小さじ1']],steps:['キャベツを食べやすく切り、フライパンに入れる。','水を加えてふたをし、中火で蒸す。やわらかくなったら火を止める。','水気を切り、ポン酢とごま油をかける。']},
 {name:'キャベツのスープ',aliases:['きゃべつのすーぷ','スープ','野菜スープ'],icon:'🥣',minutes:15,ingredients:[['キャベツ','150g'],['玉ねぎ','1/2個'],['水','400ml'],['コンソメ','小さじ2'],['塩・こしょう','少々']],steps:['キャベツはひと口大、玉ねぎは薄切りにする。','鍋に水・コンソメ・野菜を入れて煮立てる。','野菜がやわらかくなるまで煮て、塩・こしょうで味を調える。']},
 {name:'蒸し鶏',aliases:['むしどり'],icon:'🍗',minutes:25,ingredients:[['鶏もも肉','1枚（約300g）'],['酒','大さじ2'],['水','100ml'],['塩','小さじ1/4'],['しょうが','2〜3枚'],['ポン酢','適量']],steps:['鶏肉の厚い部分を開いて厚みをそろえ、塩を振る。','フライパンに鶏肉・しょうが・酒・水を入れ、ふたをして弱めの中火で蒸す。途中で裏返し、水が減ったら足す。','中心までしっかり火を通して取り出し、食べやすく切る。ポン酢を添える。']}
];
let recipeQuery='';
const normalizeRecipe=s=>s.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96)).replace(/[\s・、]/g,'');
function findRecipes(query){let q=normalizeRecipe(query);return recipeBook.filter(r=>!q||[r.name,...r.aliases,...r.ingredients.map(([name])=>name)].some(n=>normalizeRecipe(n).includes(q)))}
function recipeCard(r){return `<article class="recipe-card"><div class="recipe-title"><span class="recipe-icon">${r.icon}</span><div><h3>${esc(r.name)}</h3><p>2人分 · 約${r.minutes}分</p></div></div><div class="recipe-body"><section><h4>材料</h4><dl>${r.ingredients.map(([name,amount])=>`<div><dt>${esc(name)}</dt><dd>${esc(amount)}</dd></div>`).join('')}</dl></section><section><h4>作り方</h4><ol>${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section></div></article>`}
function updateRecipeResults(){let results=findRecipes(recipeQuery);$('#recipeCount').textContent=recipeQuery?`「${recipeQuery}」の検索結果 ${results.length}件`:`定番レシピ ${results.length}件`;$('#recipeResults').innerHTML=results.length?results.map(recipeCard).join(''):'<div class="recipe-empty"><h3>レシピが見つかりませんでした</h3><p>別の料理名や短い言葉で検索してみてください。<br>この試作版では、掲載している定番レシピを検索できます。</p></div>'}
function renderRecipeSearch(){ $('#content').innerHTML=`<div class="recipe-intro"><span class="eyebrow">FIND YOUR NEXT MEAL</span><h2>今日、何を作ろう。</h2><p>野菜・魚・肉の定番料理を、料理名や食材名で検索。</p><form id="recipeSearch" role="search"><label for="recipeInput">料理名・食材名で検索</label><div class="search-row"><input id="recipeInput" type="search" placeholder="例：親子丼、鮭、キャベツ" value="${esc(recipeQuery)}" autocomplete="off"><button class="primary">検索</button></div></form><div class="recipe-chips">${['野菜','魚','肉','鮭','鶏肉','キャベツ'].map(n=>`<button data-recipe-query="${n}">${n}</button>`).join('')}</div></div><div class="recipe-result-head"><h3 id="recipeCount" role="status" aria-live="polite"></h3><span>材料・手順をまとめて表示</span></div><div id="recipeResults"></div>`;bindRecipeSearch();updateRecipeResults()}
document.addEventListener('click',e=>{let b=e.target.closest('button[data-recipe-query]');if(!b)return;recipeQuery=b.dataset.recipeQuery;$('#recipeInput').value=recipeQuery;updateRecipeResults();$('#recipeInput').focus()});

// Keep results stable while typing, including Japanese IME conversion.
function bindRecipeSearch(){
 const input=$('#recipeInput');let composing=false;
 input.oncompositionstart=()=>{composing=true};
 input.oncompositionend=()=>{composing=false};
 input.oninput=()=>{};
 $('#recipeSearch').onsubmit=e=>{
  e.preventDefault();if(composing)return;
  recipeQuery=input.value;updateRecipeResults();
 };
}
