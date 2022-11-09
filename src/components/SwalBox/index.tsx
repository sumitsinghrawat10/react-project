import Swal from 'sweetalert2';

const SwalBox = (textMessage: string, iconUsed: any) => {
    const colour = (iconUsed === 'error' ? '' : '#233ce6');
    return Swal.fire({
        text: textMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#233ce6',
        icon: iconUsed,
        iconColor: colour,
    });
};

export default SwalBox;
