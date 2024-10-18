// financialCalculations.ts

export interface FinancialData {
    balanceSheet: {
      revenue: { ecommerce: number; wholesale: number };
      cogs: number;
      selling: number;
      marketing: number;
      coreOverhead: number;
    };
    loanDetails: {
      loanAmount: number;
      interestRate: number;
      loanTerm: number;
    };
    cashFlow: {
      operating: number;
      investing: number;
      financing: number;
    };
  }
  
  export function calculateFinancials(data: FinancialData) {
    const balanceSheet = calculateBalanceSheet(data.balanceSheet);
    const loanDetails = calculateLoanDetails(data.loanDetails);
    const cashFlow = calculateCashFlow(data.cashFlow);
  
    return {
      ...balanceSheet,
      ...loanDetails,
      ...cashFlow,
    };
  }
  
  function calculateBalanceSheet(balanceSheet: FinancialData['balanceSheet']) {
    const netRevenue = balanceSheet.revenue.ecommerce + balanceSheet.revenue.wholesale;
    const grossProfit = netRevenue - balanceSheet.cogs;
    const grossMargin = netRevenue !== 0 ? (grossProfit / netRevenue) * 100 : 0;
    const contributionProfit = grossProfit - balanceSheet.selling - balanceSheet.marketing;
    const contributionMargin = netRevenue !== 0 ? (contributionProfit / netRevenue) * 100 : 0;
    const operatingIncome = contributionProfit - balanceSheet.coreOverhead;
    const operatingMargin = netRevenue !== 0 ? (operatingIncome / netRevenue) * 100 : 0;
  
    return {
      netRevenue,
      grossProfit,
      grossMargin,
      contributionProfit,
      contributionMargin,
      operatingIncome,
      operatingMargin,
    };
  }
  
  function calculateLoanDetails(loanDetails: FinancialData['loanDetails']) {
    const monthlyInterestRate = loanDetails.interestRate / 12 / 100;
    const numberOfPayments = loanDetails.loanTerm * 12;
    const monthlyPayment = 
      loanDetails.loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
    return {
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalInterest: (monthlyPayment * numberOfPayments) - loanDetails.loanAmount,
      totalPaid: monthlyPayment * numberOfPayments,
    };
  }
  
  function calculateCashFlow(cashFlow: FinancialData['cashFlow']) {
    const netCashFlow = cashFlow.operating + cashFlow.investing + cashFlow.financing;
  
    return {
      netCashFlow,
    };
  }
  
  export function generateAmortizationSchedule(loanDetails: FinancialData['loanDetails']) {
    const { loanAmount, interestRate, loanTerm } = loanDetails;
    const monthlyInterestRate = interestRate / 12 / 100;
    const numberOfPayments = loanTerm * 12;
    const monthlyPayment = 
      loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
    let remainingBalance = loanAmount;
    const schedule = [];
  
    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
  
      schedule.push({
        month,
        payment: monthlyPayment,
        principalPayment,
        interestPayment,
        remainingBalance,
      });
    }
  
    return schedule;
  }