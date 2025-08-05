function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

const boxes = document.querySelectorAll('.box');


boxes.forEach((box) => {
  box.style.backgroundColor = getRandomColor(); 
  box.style.color = getRandomColor();          

//add event listener is JavaScript ka tarika kisi event pe react karne ka, for here its reaxn to mouse

box.addEventListener("mouseenter",() =>
{
   document.querySelector('.emoji-container').classList.add("blurred");
}
//.classlist.add css ko call krta hai through html and enables blurred which is defined there 
//andar wo element select krta  jiska class naam page hai not query
);
box.addEventListener("mouseleave", () => {
    document.querySelector('.emoji-container').classList.remove("blurred");
  });
});
const emojis = ['🌟', '✨', '💫','🎉', '🪐', '☁️','🔥', '💥', '❤️', '🧠', '🤖'];
const emojiContainer = document.querySelector('.emoji-container');

for (let i = 0; i < 42; i++) {
  const emoji = document.createElement('div');// cresting div element directly from js, here it is names emoji as it will perform that functio
  emoji.classList.add('emoji');
  emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)]; //random emoji select krna

 //randomized position
  emoji.style.left = `${Math.random() * 100}vw`;
  emoji.style.top = `${Math.random() * 100}vh`;


  emoji.style.fontSize = `${Math.random() * 20 + 20}px`;
  emoji.style.animationDuration = `${Math.random() * 10 + 5}s`;

  emojiContainer.appendChild(emoji); //Usme yeh emoji div ko add kar diya , iske pehle tak we were deciding elements 
}