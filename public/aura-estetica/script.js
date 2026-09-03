document.documentElement.classList.add('js');

const CONFIG={
  whatsapp:'5512991865893',
  whatsappMessage:'Olá, gostaria de saber mais sobre os procedimentos e agendar uma avaliação.'
};

const whatsappUrl=`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;

document.querySelectorAll('[data-whatsapp]').forEach((link)=>{
  link.href=whatsappUrl;
  link.target='_blank';
  link.rel='noopener noreferrer';
});

const menuButton=document.querySelector('.menu-button');
const mobileMenu=document.querySelector('.mobile-menu');

if(menuButton&&mobileMenu){
  menuButton.addEventListener('click',()=>{
    const open=mobileMenu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded',String(open));
  });
  mobileMenu.querySelectorAll('a').forEach((link)=>{
    link.addEventListener('click',()=>{
      mobileMenu.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
    });
  });
}

const revealItems=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.10});
  revealItems.forEach((item)=>observer.observe(item));
}else{
  revealItems.forEach((item)=>item.classList.add('visible'));
}
