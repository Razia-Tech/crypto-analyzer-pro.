document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("nav button");
    const contentArea = document.getElementById("content-area");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const moduleName = button.dataset.module;
            try {
                const module = await import(`./${moduleName}.js`);
                contentArea.innerHTML = ""; // Kosongkan sebelum render
                module.render(contentArea);
            } catch (error) {
                contentArea.innerHTML = `<p style="color:red;">Gagal memuat modul: ${moduleName}</p>`;
                console.error(error);
            }
        });
    });
});

