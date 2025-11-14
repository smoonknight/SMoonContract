async function loadContract() {
    const guid = document.getElementById("guidInput").value.trim();
    if (guid.length === 0) {
        document.getElementById("result").textContent = "GUID cannot be empty.";
        return;
    }

    const baseUrl = `${location.origin}${location.pathname.replace(/\/index\.html$/, "")}`;

    const url = `${baseUrl}/data/${guid}.json`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("File not found or cannot be loaded.");
        }

        const data = await res.json();

        document.getElementById("result").textContent = 
            JSON.stringify(data, null, 4);

    } catch (err) {
        document.getElementById("result").textContent =
            "Error: " + err.message;
    }
}
