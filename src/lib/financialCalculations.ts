export interface FinancialData {
    balanceSheet: {
      revenue: { ecommerce: number; wholesale: number };
      cogs: number;
      selling: number;
      marketing: number;
      coreOverhead: number;
    };
    loanDetails: {
      isBusinessPurchase: boolean;
      purchasePrice: number;
      downPayment: number;
      thirdPartyInvestment: number;
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
  
  export interface CalculatedFinancials {
    netRevenue: number;
    grossProfit: number;
    grossMargin: number;
    contributionProfit: number;
    contributionMargin: number;
    operatingIncome: number;
    operatingMargin: number;
    loanAmount: number;
    monthlyPayment: number;
    totalInterest: number;
    totalPaid: number;
    netCashFlow: number;
    monthlyInterestRate: number;
    numberOfPayments: number;
  }
  
  export function calculateFinancials(data: FinancialData): CalculatedFinancials {
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
    const loanAmount = loanDetails.isBusinessPurchase
      ? loanDetails.purchasePrice - loanDetails.downPayment - loanDetails.thirdPartyInvestment
      : loanDetails.loanAmount;
    const monthlyInterestRate = loanDetails.interestRate / 12 / 100;
    const numberOfPayments = loanDetails.loanTerm * 12;
    const monthlyPayment = 
      loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
    return {
      loanAmount,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalInterest: (monthlyPayment * numberOfPayments) - loanAmount,
      totalPaid: monthlyPayment * numberOfPayments,
      monthlyInterestRate,
      numberOfPayments,
    };
  }
  
  function calculateCashFlow(cashFlow: FinancialData['cashFlow']) {
    const netCashFlow = cashFlow.operating + cashFlow.investing + cashFlow.financing;
  
    return {
      netCashFlow,
    };
  }
  
  export interface AmortizationScheduleItem {
    month: number;
    payment: number;
    principalPayment: number;
    interestPayment: number;
    remainingBalance: number;
    cumulativeInterest: number;
  }
  
  export function generateAmortizationSchedule(loanDetails: FinancialData['loanDetails']): AmortizationScheduleItem[] {
    const { loanAmount, interestRate, loanTerm } = loanDetails;
    const monthlyInterestRate = interestRate / 12 / 100;
    const numberOfPayments = loanTerm * 12;
    const monthlyPayment = 
      loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
    let remainingBalance = loanAmount;
    let cumulativeInterest = 0;
    const schedule: AmortizationScheduleItem[] = [];
  
    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      cumulativeInterest += interestPayment;
  
      schedule.push({
        month,
        payment: monthlyPayment,
        principalPayment,
        interestPayment,
        remainingBalance,
        cumulativeInterest,
      });
    }
  
    return schedule;
  }
  
  export function calculateCombinedSchedule(financials: CalculatedFinancials, loanDetails: FinancialData['loanDetails'], numberOfMonths: number = 120) {
    const loanAmount = loanDetails.isBusinessPurchase
      ? loanDetails.purchasePrice - loanDetails.downPayment - loanDetails.thirdPartyInvestment
      : loanDetails.loanAmount;
    let remainingBalance = loanAmount;
    let cumulativeProfit = -loanAmount;
    let cumulativeCashFlow = 0;
    const schedule = [];
    let breakEvenMonth = null;
  
    const monthlyProfit = financials.operatingIncome / 12;
    const monthlyCashFlow = financials.netCashFlow / 12;
  
    for (let month = 1; month <= Math.max(numberOfMonths, financials.numberOfPayments); month++) {
      if (month <= financials.numberOfPayments) {
        const interestPayment = remainingBalance * financials.monthlyInterestRate;
        const principalPayment = financials.monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;
      }
  
      cumulativeProfit += monthlyProfit;
      cumulativeCashFlow += monthlyCashFlow;
  
      if (cumulativeProfit >= 0 && breakEvenMonth === null) {
        breakEvenMonth = month;
      }
  
      schedule.push({
        month,
        remainingBalance,
        cumulativeProfit,
        cumulativeCashFlow
      });
    }
  
    return { schedule, breakEvenMonth };
  }