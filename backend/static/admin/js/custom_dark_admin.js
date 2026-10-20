function toggleUserActive(input) {
  const userId = input.getAttribute('data-user-id');
  if (!userId) return;

  // Optimistic UI feedback
  input.disabled = true;

  fetch('/api/admin/toggle-user-active/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken') || ''
    },
    body: JSON.stringify({ user_id: userId })
  })
  .then(res => res.json())
  .then(data => {
    input.disabled = false;
    if (data.success) {
      input.checked = data.is_active;
    } else {
      alert(data.error || 'حدث خطأ أثناء تعديل الحالة');
      input.checked = !input.checked;
    }
  })
  .catch(err => {
    input.disabled = false;
    input.checked = !input.checked;
    console.error('Error toggling active:', err);
  });
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
