async function loadContract() {
    const guid = document.getElementById("guidInput").value.trim();
    const resultEl = document.getElementById("result");

    if (!guid) {
        resultEl.textContent = "GUID cannot be empty.";
        resultEl.style.color = "#f87171"; // merah
        return;
    }

    const baseUrl = `${location.origin}${location.pathname.replace(/\/index\.html$/, "")}`;
    const url = `${baseUrl}/data/${guid}.json`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("File not found or cannot be loaded.");

        const data = await res.json();

        // Validasi status
        const isAllowed = data.status === "allowed";
        const color = isAllowed ? "#4ade80" : "#f87171"; // hijau/merah

        resultEl.style.color = color;
        resultEl.textContent = `
GUID: ${data.guid || guid}
Status: ${data.status}
Password: ${data.password || "(not available)"}
Last Edit: ${data.lastEdit || "(unknown)"}
        `.trim();

    } catch (err) {
        resultEl.style.color = "#f87171";
        resultEl.textContent = "Error: " + err.message;
    }
}
