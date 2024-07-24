import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const OutsideHome = () => {
  const [show, setShow] = React.useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

  React.useEffect(() => {
    if (id) {
      setShow(true);
    }
  }, [id]);

  const handleClose = () => setShow(false);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body>ID: {id}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OutsideHome;
