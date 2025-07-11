document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    const toRegisterBtn = document.getElementById('toRegister');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.textContent = '';
  
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
  
      try {
        const res = await fetch('https://login-u8as.onrender.com/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
  
        const result = await res.json();
  
        if (result.success) {
          // Редирект на нужный сайт
          window.location.href = result.redirectUrl;
        } else {
          errorMsg.textContent = result.message;
        }
      } catch (error) {
        errorMsg.textContent = 'Ошибка сети. Попробуйте позже.';
      }
    });
  
    toRegisterBtn.addEventListener('click', () => {
      window.location.href = '/register.html';
    });
  });
  