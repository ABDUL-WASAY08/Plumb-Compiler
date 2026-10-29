import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// ── Toasts ────────────────────────────────────────────────────────────────
// Top-right, 4s, animated progress bar, pauses while hovered, always closable.
const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const toastThemes = {
  error: {
    background: '#FEF9C3', // light yellow
    color: '#78350F', // amber-900 brown
    icon: 'warning',
    iconColor: '#92400E', // amber-800
  },
  success: {
    background: '#ECFDF5', // emerald-50
    color: '#064E3B', // emerald-900
    icon: 'success',
    iconColor: '#059669', // emerald-600
  },
  warning: {
    background: '#FFFBEB', // amber-50
    color: '#92400E', // amber-800
    icon: 'warning',
    iconColor: '#D97706', // amber-600
  },
  info: {
    background: '#EFF6FF', // blue-50
    color: '#1E3A8A', // blue-900
    icon: 'info',
    iconColor: '#3B82F6', // blue-500
  },
};

const triggerToast = (msg, themeKey) => {
  const theme = toastThemes[themeKey] || toastThemes.info;

  return Toast.fire({
    icon: theme.icon,
    iconColor: theme.iconColor,
    background: theme.background,
    color: theme.color,
    title: msg,
    customClass: {
      popup: 'rounded-2xl border shadow-xl font-medium text-[13px] px-5 py-3 relative',
      timerProgressBar: 'bg-black/10',
    },
  });
};

export const showToast = {
  success: (msg) => triggerToast(msg, 'success'),
  error: (msg) => triggerToast(msg, 'error'),
  info: (msg) => triggerToast(msg, 'info'),
  warning: (msg) => triggerToast(msg, 'warning'),
};

// ── Confirmation / prompt dialogs ─────────────────────────────────────────
const dialogButtons = {
  popup: 'rounded-3xl',
  confirmButton: 'rounded-xl px-6 py-3',
  cancelButton: 'rounded-xl px-6 py-3',
};

export const showAlert = {
  /** Yes/no confirmation. Resolves to true when confirmed. */
  confirm: async ({ title, text, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    const result = await MySwal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#1E3A8A',
      cancelButtonColor: '#EF4444',
      reverseButtons: true,
      customClass: { ...dialogButtons },
    });

    return result.isConfirmed;
  },

  /**
   * Prompts for a date+time. Resolves to the value string, or null when
   * cancelled — so always guard with `if (!date) return;`.
   */
  datePrompt: async ({ title, text, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    const result = await MySwal.fire({
      title,
      html: `<p style="margin:0 0 12px">${text}</p>
             <input id="swal-date-input" type="datetime-local" class="swal2-input" />`,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#1E3A8A',
      cancelButtonColor: '#EF4444',
      reverseButtons: true,
      customClass: { ...dialogButtons },
      preConfirm: () => {
        const value = document.getElementById('swal-date-input')?.value;
        if (!value) {
          Swal.showValidationMessage('Please select a deadline');
          return false;
        }
        return value;
      },
    });

    return result.isConfirmed ? result.value : null;
  },
};
