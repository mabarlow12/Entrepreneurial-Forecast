// Aggregates all modules' data
async function initOverview(){
  const airbnb=await loadJSON('data/airbnb.json');
  const content=await loadJSON('data/content.json');
  const trading=await loadJSON('data/trading.json');
  const goals=await loadJSON('data/goals.json');
  const totalRev=calcTotal(airbnb,'revenue')+calcTotal(content,'revenue')+calcTotal(trading,'profit');
  document.getElementById('overview-section').innerHTML = renderCard('Total Revenue', `$${totalRev.toLocaleString()}`);
}
initOverview();