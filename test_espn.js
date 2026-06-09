async function test() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard');
    const data = await res.json();
    console.log("BRA.1 (Brasileirão) matches today:", data.events?.length);
    if (data.events?.length > 0) {
      console.log(data.events[0].name, data.events[0].status.type.detail);
    }
    
    // Check all soccer
    const res2 = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
    const data2 = await res2.json();
    console.log("All Soccer matches today:", data2.events?.length);
    if (data2.events?.length > 0) {
      console.log(data2.events[0].name, data2.events[0].status.type.detail);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
