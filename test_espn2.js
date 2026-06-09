async function test() {
  const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
  const data = await res.json();
  const ev = data.events[0];
  console.log(JSON.stringify(ev.competitions[0].competitors, null, 2));
  console.log("League:", data.leagues[0].name);
}
test();
