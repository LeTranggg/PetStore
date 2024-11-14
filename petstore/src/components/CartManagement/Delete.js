import axios from "../../utils/Axios";

const Delete = ({ onSuccess }) => {
  const handleDelete = async (cartItemId) => {
    try {
      await axios.delete(`/cart/${cartItemId}`);
      onSuccess();
    } catch (error) {
      alert('Error removing item from cart');
      console.error('Error removing from cart:', error);
    }
  };

  return { handleDelete };
}

export default Delete;