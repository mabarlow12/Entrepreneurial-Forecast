// Handles CRUD operations for data retrieval and storage.
async function loadJSON(path){const r=await fetch(path);return await r.json();}