import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/Axios";
import { Card } from "react-bootstrap";

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const { productId } = useParams();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`/product/product-detail/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product detail:', error);
      }
    };

    fetchProductDetail();
  }, [productId]);

  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-lg"><span className="font-semibold">Price:</span> ${product.price}</p>
            <p><span className="font-semibold">Category:</span> {product.category.name}</p>
            <p><span className="font-semibold">Supplier:</span> {product.supplier.name}</p>
            <p><span className="font-semibold">Description:</span></p>
            <p className="mt-2">{product.description}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Classifications</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Dimensions (H×L×W)</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {product.classifications.map((classification) => (
              <tr key={classification.id}>
                <td>{classification.name}</td>
                <td>{classification.value}</td>
                <td>${classification.price}</td>
                <td>{classification.quantity}</td>
                <td>
                  {classification.height}×{classification.length}×{classification.width}
                </td>
                <td>{classification.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default ProductDetail;