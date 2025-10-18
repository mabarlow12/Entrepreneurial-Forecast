// Shared financial calculations.
function calcTotal(arr,key){return arr.reduce((t,i)=>t+(i[key]||0),0);}