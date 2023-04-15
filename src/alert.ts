export function showAlert(message: string, color:string, duration: number = 3000) {
    const colors: Record<string,string> = {
        'red': '#E60100E7'
    }

    const alertComponent = document.createElement("div");
    alertComponent.style.backgroundColor = colors[color]
    alertComponent.className = "alert-component";
    alertComponent.textContent = message;
  
    // Append the alert component to the body.
    document.body.appendChild(alertComponent);
  
    // Make the alert component visible
    setTimeout(() => {
        alertComponent.style.bottom = '1.5rem'
        alertComponent.style.opacity = '1'
    }, 100);
  
    // Hide the alert component and remove it from the DOM after the specified duration.
    setTimeout(() => {
      alertComponent.style.bottom = '0rem'
      alertComponent.style.opacity = '0'

      setTimeout(() => {
        alertComponent.remove();
      }, 300);
    }, duration);
  }  