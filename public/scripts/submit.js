document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Disable the submit button
    const submitButton = document.querySelector("button[type='submit']");
    submitButton.disabled = true;

    // Make screen black and center loading spinner
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "black";
    overlay.style.opacity = "0.8";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    // Create loading circle
    const spinner = document.createElement("div");
    spinner.style.width = "50px";
    spinner.style.height = "50px";
    spinner.style.border = "5px solid #f3f3f3";
    spinner.style.borderTop = "5px solid #3498db";
    spinner.style.borderRadius = "50%";
    spinner.style.animation = "spin 1s linear infinite";

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);

    // CSS for spinner animation
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Remove overlay after 3 seconds
    setTimeout(() => {
        document.body.removeChild(overlay);
        submitButton.disabled = false;
    }, 3000);
});