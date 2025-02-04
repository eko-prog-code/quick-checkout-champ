import { ref, push, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Sale } from '@/types/pos';

const SALES_REF = 'sales';

export const createSale = async (sale: Omit<Sale, 'id'>): Promise<void> => {
  try {
    const newSaleRef = push(ref(db, SALES_REF));
    await push(ref(db, SALES_REF), {
      ...sale,
      id: newSaleRef.key
    });
    console.log('Sale recorded successfully');
  } catch (error) {
    console.error('Error recording sale:', error);
    throw error;
  }
};

export const subscribeToSales = (callback: (sales: Sale[]) => void): () => void => {
  const salesRef = ref(db, SALES_REF);
  
  onValue(salesRef, (snapshot) => {
    const sales: Sale[] = [];
    snapshot.forEach((childSnapshot) => {
      const sale = childSnapshot.val();
      sales.push(sale);
    });
    callback(sales);
  });

  return () => off(salesRef);
};