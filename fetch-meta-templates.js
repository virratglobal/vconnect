const waba_id = "27091297057198631";
const access_token = "EAAfG9m5O3WMBRmAFfcXoAov3k20yK3tiVuExtoqzNgeEkk8cGn4op7vKU36Swp85mOCmOYAZBik5IoWAqDpaIHf746Y1cJ4nrG4g3qvvSiGpkns2s4FYpvZB3fq5sKY6B5CwLRHDxLu1jWVzZBlFUZCQodyecoCGv0k9HQjq0Wafg0ZC0cPMAozODjKXeVfh6LgZDZD";

const url = `https://graph.facebook.com/v20.0/${waba_id}/message_templates?limit=100`;

try {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });
  const json = await res.json();
  console.log("Status:", res.status);
  console.log("Templates:", JSON.stringify(json, null, 2));
} catch (e) {
  console.error("Error:", e);
}
