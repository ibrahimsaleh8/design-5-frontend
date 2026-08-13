import Swal from 'sweetalert2';

export const Toast = ({icon,message}:{icon:"warning" |'error'|'success'| 'info'| 'question',message:string}) => {
    const Toast = Swal.mixin({
        toast: true,
        position: "bottom-right",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon,
        title: message
      });
      
}
