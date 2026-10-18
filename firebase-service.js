var FB_URL = 'https://pansakitc-default-rtdb.europe-west1.firebasedatabase.app/inventory.json';

async function fetchFromFirebase() {
  try {
    var r = await fetch(FB_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    var d = await r.json();
    return d && typeof d === 'object' && d.items ? d.items : null;
  } catch (e) {
    console.error('Firebase read failed:', e);
    return null;
  }
}

async function saveToFirebase(cats) {
  var m = {};
  cats.forEach(function(c) {
    c.items.forEach(function(i) {
      // מבנה נתונים מעודכן: [כמות, פתוח, סוף, הערה, חסר, יש, יחידות]
      var a = [i.q == null ? null : i.q, !!i.o, !!i.f, i.t || '', !!i.s, !!i.y, i.u || 'יח'];
      if (JSON.stringify(a) !== '[null,false,false,"",false,false,"יח"]') {
        var cleanKey = (c.n + '|' + i.n).replace(/[\.=#\$\[\]\/]/g, '_');
        m[cleanKey] = a;
      }
    });
  });

  try {
    var r = await fetch(FB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: m, t: new Date().toISOString() })
    });
    
    if (!r.ok) {
      var errText = await r.text();
      console.error('Firebase Error Details:', errText);
      throw new Error('HTTP ' + r.status);
    }
    return true;
  } catch (e) {
    console.error('Firebase write failed:', e);
    return false;
  }
}
