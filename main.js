import { createAppIframeSDK } from '@whop/sdk';

const infoDiv = document.getElementById('info');

const sdk = createAppIframeSDK();

sdk.onReady(async () => {
  const token = await sdk.getUserToken();

  if (!token) {
    infoDiv.textContent = '⚠️ No se pudo obtener el token Whop.';
    return;
  }

  const response = await fetch('/api/experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (data.error) {
    infoDiv.textContent = `❌ Error: ${data.error}`;
  } else {
    infoDiv.innerHTML = `
      <p><strong>ID:</strong> ${data.user.id}</p>
      <p><strong>Usuario:</strong> ${data.user.username}</p>
      <p><strong>Email:</strong> ${data.user.email}</p>
      <p><strong>Custom:</strong> ${JSON.stringify(data.user.customFields || {})}</p>
    `;
  }
});
