// client/src/components/Patient/ViewBills.js
import React from 'react';



function ViewBills() {
  // Since billing is a dummy system, we'll use mock data
  const bills = [
    { id: 1, date: '2023-10-01', amount: '$200', status: 'Paid' },
    { id: 2, date: '2023-10-15', amount: '$150', status: 'Unpaid' },
    // Add additional mock bills as needed
  ];

  return (
    <div>
      

      <h2>Your Bills</h2>
      <table>
        <thead>
          <tr>
            <th>Bill ID</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id}>
              <td>{bill.id}</td>
              <td>{bill.date}</td>
              <td>{bill.amount}</td>
              <td>{bill.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewBills;
