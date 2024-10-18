export function generateSampleProject() {
    const revenue = 250000;
    const cogs = revenue * 0.6; // 60% of revenue
    const grossProfit = revenue - cogs;
    const operatingExpenses = grossProfit * 0.7; // 70% of gross profit
    const operatingIncome = grossProfit - operatingExpenses;
  
    return {
      id: Date.now().toString(), // Use current timestamp as ID
      name: "Sample Project",
      data: {
        balanceSheet: {
          revenue: {
            ecommerce: revenue * 0.2, // 20% from online sales
            wholesale: revenue * 0.8  // 80% from in-store sales
          },
          cogs: cogs,
          selling: operatingExpenses * 0.4, // 40% of operating expenses
          marketing: operatingExpenses * 0.2, // 20% of operating expenses
          coreOverhead: operatingExpenses * 0.4 // 40% of operating expenses
        },
        loanDetails: {
          isBusinessPurchase: true,
          purchasePrice: 500000,
          downPayment: 100000,
          thirdPartyInvestment: 50000,
          loanAmount: 350000,
          interestRate: 5.5,
          loanTerm: 10
        },
        cashFlow: {
          operatingActivities: {
            netIncome: operatingIncome,
            depreciation: 15000,
            accountsReceivable: -5000,
            inventory: -10000,
            accountsPayable: 8000,
            otherOperating: -2000
          },
          investingActivities: {
            capitalExpenditures: -30000,
            investments: 0,
            otherInvesting: -5000
          },
          financingActivities: {
            debtIssuance: 350000,
            debtRepayment: -35000,
            dividendsPaid: 0,
            stockIssuance: 0,
            otherFinancing: -2000
          }
        }
      }
    };
  }