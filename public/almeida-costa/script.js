document.documentElement.classList.add('js');
const menuButton=document.querySelector('.menu-button');
const mobileMenu=document.querySelector('.mobile-menu');
if(menuButton&&mobileMenu){menuButton.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{mobileMenu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));}
const revealItems=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}})},{threshold:.1});revealItems.forEach(item=>observer.observe(item));}else{revealItems.forEach(item=>item.classList.add('visible'));}
const hideBroken=img=>{img.hidden=true;};
addEventListener('error',event=>{const el=event.target;if(el&&el.tagName==='IMG'){hideBroken(el);}},true);
addEventListener('load',()=>{document.querySelectorAll('img').forEach(img=>{if(img.complete&&img.naturalWidth===0){hideBroken(img);}});});
