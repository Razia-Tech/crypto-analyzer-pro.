document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll("#dashboard-nav button");
    const contentArea = document.getElementById("dashboard-content");

    navButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const moduleName = btn.dataset.module;
            try {
                contentArea.innerHTML = `<p>Loading ${moduleName}...</p>`;
                const module = await import(`./modules/${moduleName}.js`);
                contentArea.innerHTML = "";
                module.render(contentArea);
            } catch (error) {
                console.error("Error loading module:", error);
                contentArea.innerHTML = `<p>Error loading ${moduleName}</p>`;
            }
        });
    });
});
