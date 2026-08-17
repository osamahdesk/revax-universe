# تحقق إصلاح بداية الموشن وفقاعة الزجاج

أصبح target progress محسوبًا من `window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)` بدل بدء الحساب عند دخول القسم sticky؛ لذلك يبدأ أول تمرير من الإطار صفر على مستوى الموقع كله. الفيديو لا يستخدم `autoplay` ولا `play()`، ويبقى paused حتى يتغير progress بسبب تمرير فعلي.

أضيفت `ScrollCue` كفقاعة ثابتة بحدود زجاجية نيون، خلفية navy/cyan شفافة، blur وsaturation وglow، وتختفي تدريجيًا مع أول تمرير. لا تظهر الفقاعة على كامل الصفحة الملتقطة لأن التقاط full-page يخفي بعض عناصر fixed، لكن لا توجد أخطاء build أو سجل ظاهرة، والنسخة متجاوبة على الهاتف.
