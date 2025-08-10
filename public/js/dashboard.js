document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll("#dashboard-nav button");
    const contentArea = document.getElementById("dashboard-content");
// Ambil client dari window
const supaAuth = window.supaAuth;

// Gunakan supabase global dari window
const supabase = window.supaAuth;

async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
  } else {
    console.log('User login:', user.email);
  }
}

checkUser();
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
