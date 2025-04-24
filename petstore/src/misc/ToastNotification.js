import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

function ToastNotification({ show, onClose, message, type = 'success', autoHide = true, delay = 30000 }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        show={visible}
        onClose={handleClose}
        delay={autoHide ? delay : null}
        autohide={autoHide}
        bg={type === 'success' ? 'success' : 'danger'}
      >
        <Toast.Header>
          <strong className="me-auto">{type === 'success' ? 'Success' : 'Error'}</strong>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default ToastNotification;