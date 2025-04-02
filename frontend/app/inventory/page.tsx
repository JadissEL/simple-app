import React from 'react';
import { getInventoryData } from './page.server';
import InventoryView from '../../src/components/InventoryView';

export default async function InventoryPage() {
  const inventoryData = await getInventoryData();
  
  return (
    <main>
      <h1>Public Inventory View</h1>
      <InventoryView initialData={inventoryData} />
    </main>
  );
}
