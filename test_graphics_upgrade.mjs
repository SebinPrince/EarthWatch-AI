import fs from 'fs';

async function main() {
  const listRes = await fetch('http://localhost:9222/json/list');
  const targets = await listRes.json();
  const page = targets.find(t => t.type === 'page');
  if (!page) {
    console.error('No page target found');
    return;
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  // Set device metrics
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate to ?explore=true
  console.log('Navigating to http://localhost:5173/?explore=true');
  await send('Page.navigate', { url: 'http://localhost:5173/?explore=true' });
  await new Promise(r => setTimeout(r, 4500));

  // 1. Capture Enhanced Globe with Shaders, Water Normals, and Bloom
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:/Sebin/3D/enhanced_globe_graphics.png', Buffer.from(shot1.data, 'base64'));
  console.log('Captured enhanced_globe_graphics.png');

  // 2. Select a satellite to demonstrate 3D Holographic Sensor Cone & Ground Sweep Beam
  console.log('Selecting satellite to inspect 3D projection cone & sensor sweep...');
  await send('Runtime.evaluate', {
    expression: 'document.querySelectorAll("button span")?.forEach(el => { if (el.innerText.includes("Satellites Fleet")) el.parentElement.click(); })'
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click first satellite card
  await send('Runtime.evaluate', {
    expression: 'document.querySelectorAll(".glass-panel div.cursor-pointer, .glass-panel div[role=button]")[0]?.click()'
  });
  await new Promise(r => setTimeout(r, 3000));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:/Sebin/3D/satellite_3d_hologram_cone.png', Buffer.from(shot2.data, 'base64'));
  console.log('Captured satellite_3d_hologram_cone.png');

  // 3. Switch to solar terminator day/night mode
  console.log('Toggling Solar Day/Night Lighting mode...');
  await send('Runtime.evaluate', {
    expression: 'document.querySelectorAll("button[title*=\'Day/Night\']")[0]?.click()'
  });
  await new Promise(r => setTimeout(r, 2000));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:/Sebin/3D/solar_terminator_lighting.png', Buffer.from(shot3.data, 'base64'));
  console.log('Captured solar_terminator_lighting.png');

  ws.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
