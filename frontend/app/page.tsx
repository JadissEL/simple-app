import React from 'react';
import { getInventoryData } from './page.server';
import InventoryView from '../../components/InventoryView';

export default async function Home() {
  const initialData = await getInventoryData();
  
  return (
    <main>
      <h1>Food Inventory App</h1>
      <p>Welcome to our food inventory management system</p>
      <InventoryView initialData={initialData} />
    </main>
  );
}
