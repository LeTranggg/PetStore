import axios from "../../utils/Axios";

const Update = ({ onSuccess }) => {
  const handleUpdate = async (cartItemId, updatedQuantity) => {
    try {
      // Fetch the existing cart item from the server
      const { data: existingCartItem } = await axios.get(`/cart/${cartItemId}`);

      // Update the quantity in the existing cart item
      existingCartItem.Quantity = updatedQuantity;

      // Send the updated cart item as the payload
      await axios.put(`/cart/${cartItemId}`, existingCartItem);
      onSuccess();
    } catch (error) {
      alert('Error updating cart item');
      console.error('Error updating cart item:', error.response ? error.response.data : error);
    }
  };

  return { handleUpdate };
};

export default Update;