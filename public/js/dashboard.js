document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll("#dashboard-nav button");
    const contentArea = document.getElementById("dashboard-content");
// Ambil client dari window
const supaAuth = window.supaAuth;

async function getUserProfile() {
  const { data, error } = await supaAuth.auth.getUser();
  if (error) {
    console.error("Error ambil user:", error.message);
    return;
  }
  console.log("User login:", data.user);
}

getUserProfile();

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
