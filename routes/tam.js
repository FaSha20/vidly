


function setDateOut(now){
    const [y, m, d] = [now.getFullYear(), now.getMonth(), now.getDate()];
    if(m == 11) return `${y + 1}/${1}/${d}`;
    return `${y}/${m + 1}/${d}`;    
}

const a= setDateOut(new Date());
console.log(a);

// const date = new Date();
// const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()];
// const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()];
// console.log([month, day, year]);
// console.log([hour, minutes, seconds]);