import lvls from './levels.js';

const buttons = [];
const levelButtons = [];
let tutorial;
let global;

export const setGlobal = g =>{
    global = g;
}

const createButton = (text, fontSize) => {
    const button = document.createElement('div')
    // button.style.fontSize = `${fontSize}px`;

    const svg = createSVG(text, fontSize);
    svg.style.width = svg.style.height = "100%";
    svg.style.marginTop ='6%';
    button.appendChild(svg);

    button.classList.add('b');
    buttons.push(button);

    return button;
}
const createSVG = (text, fontSize)=>{
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${text}</text>`
    svg.setAttribute("viewBox", `0 0 ${fontSize} 20`);
    return svg;
}
const uiHolder = document.createElement('div');
uiHolder.classList.add('ui');
document.body.appendChild(uiHolder);

const endScreen = document.createElement('div');
document.body.appendChild(endScreen);
endScreen.classList.add('ed');


//startButton
const startBut = createButton("▶", 20);
startBut.style.marginTop = '50%';
startBut.style.width = "10%";
startBut.style.height = "10%";
const innerSVG = startBut.querySelector('svg');
innerSVG.style.marginTop = "21%";
innerSVG.style.marginLeft = "5%";
uiHolder.appendChild(startBut);

//levelGrid
const levelHolder = document.createElement('div');
for (let i = 1; i < lvls.length; i++) {
    let but = createButton(i, 30);
    if(i != 1) but.classList.add('l');
    but.style.width = but.style.height = '100%';
    levelHolder.appendChild(but);
    levelButtons.push(but);
    but.onclick = ()=>{
        global.loadLevel(i);
        hide(levelHolder);
    }
}
levelHolder.classList.add('lvls');
uiHolder.appendChild(levelHolder);

const show = el => el.style.display = 'grid';
const hide = el => el.style.display = 'none';

hide(levelHolder);

startBut.onclick = () => {
    unlockLevels(global.unlockedLevels);
    show(levelHolder);
    hide(startBut);
}
const unlockLevels = (n) => {
    for (let i = 1; i < levelButtons.length; i++) {
        if (i > n - 1) levelButtons[i].classList.add('l');
        else levelButtons[i].classList.remove('l');
    }
    localStorage.setItem(global.saveKey, global.unlockedLevels);
}
let showLevelTimeout = null;
export const showLevels = ()=>{
    const func = ()=>{
        unlockLevels(global.unlockedLevels);
        show(levelHolder);
        showLevelTimeout = null;
        hide(endScreen);
    }
    if(!showLevelTimeout)  showLevelTimeout = setTimeout(func, 2000)
}
export const showEndScreen = (win)=>{
    if(win){
        endScreen.innerText = '✓';
        endScreen.classList.remove('ls');
    }else{
        endScreen.innerText = '✖';
        endScreen.classList.add('ls');
    }
    show(endScreen);
}
export const showTutorial = (n=0) => {
    if(n === 0){
        if(!tutorial) return;
        tutorial.parentNode.removeChild(tutorial);
        tutorial = null;
    }else {
        const svg = createSVG('»', 20)
        svg.style.width = svg.style.height ='20%';
        svg.classList.add('t1');
        uiHolder.appendChild(svg);
        tutorial = svg;

        if(n == 2) svg.classList.add('t2');
        if(n == 3) svg.classList.add('t3');

    }
}

export const uiResize = () => {
    const min = Math.min(window.innerWidth, window.innerHeight);
    uiHolder.style.width = min+"px";
    uiHolder.style.height = min+"px";
}
export const addBlocker = (w,h,l,t) => {
    const block = document.createElement('div');
    block.classList.add('bl');
    block.style.width = `${w}%`;
    block.style.height = `${h}%`;
    block.style.left = `${l}%`;
    block.style.top = `${t}%`;
    uiHolder.appendChild(block);
}

export const destroyBlockers = () =>{
    uiHolder.querySelectorAll('.bl').forEach(block=>{
        block.parentNode.removeChild(block);
    })
}

//CHEAT
document.addEventListener("keydown", (e)=>{
    if(e.keyCode == 83 && e.shiftKey) {
        global.unlockedLevels++;
        unlockLevels(global.unlockedLevels);
    }
}, true);