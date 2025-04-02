import React from 'react';
import styles from './InventoryView.module.css';

interface FoodItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  storage_location: string;
  expiry_date?: string;
}

interface InventoryViewProps {
  initialData: FoodItem[];
}

const InventoryView: React.FC<InventoryViewProps> = ({ initialData }) => {
  return (
    <div className={styles.inventoryView}>
      <h2>Current Inventory</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Expiry</th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.quantity} {item.unit}</td>
              <td>{item.storage_location}</td>
              <td>{item.expiry_date || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryView;
